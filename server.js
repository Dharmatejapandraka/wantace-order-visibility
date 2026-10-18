require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "wantace_order_tracker";
const STATUSES = ["New", "In Production", "At Polishing", "Ready to Pack", "Partially Dispatched", "Dispatched", "On Hold", "Returned"];

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

let db;
let orders;
let polishing;

function validOrder(body) {
  return body && String(body.customer || "").trim() && String(body.product || "").trim()
    && Number(body.quantity) > 0 && String(body.unit || "").trim()
    && Number(body.rate) >= 0 && STATUSES.includes(body.status || "New");
}
function cleanOrder(body) {
  return {
    orderNo: String(body.orderNo || "").trim() || `ORD-${Date.now().toString().slice(-8)}`,
    customer: String(body.customer).trim(),
    product: String(body.product).trim(),
    quantity: Number(body.quantity),
    unit: String(body.unit).trim(),
    rate: Number(body.rate || 0),
    status: body.status || "New",
    dispatchedQty: Math.max(0, Number(body.dispatchedQty || 0)),
    paymentHold: Boolean(body.paymentHold),
    blocker: String(body.blocker || "").trim(),
    dueDate: body.dueDate || "",
    notes: String(body.notes || "").trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", database: db ? "connected" : "disconnected" }));

app.get("/api/orders", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.q) {
      const q = String(req.query.q).slice(0, 100);
      filter.$or = [
        { customer: { $regex: q, $options: "i" } },
        { product: { $regex: q, $options: "i" } },
        { orderNo: { $regex: q, $options: "i" } }
      ];
    }
    const result = await orders.find(filter).sort({ updatedAt: -1 }).limit(500).toArray();
    res.json(result);
  } catch (e) { res.status(500).json({ error: "Could not load orders." }); }
});

app.post("/api/orders", async (req, res) => {
  if (!validOrder(req.body)) return res.status(400).json({ error: "Customer, product, positive quantity, unit, rate and valid status are required." });
  try {
    const order = cleanOrder(req.body);
    const result = await orders.insertOne(order);
    res.status(201).json({ ...order, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: "Could not create order." }); }
});

app.patch("/api/orders/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid order ID." });
  const allowed = ["status", "dispatchedQty", "paymentHold", "blocker", "dueDate", "notes", "rate"];
  const update = {};
  for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
  if (update.status && !STATUSES.includes(update.status)) return res.status(400).json({ error: "Invalid status." });
  if (update.dispatchedQty !== undefined) update.dispatchedQty = Math.max(0, Number(update.dispatchedQty));
  update.updatedAt = new Date();
  try {
    const result = await orders.updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    if (!result.matchedCount) return res.status(404).json({ error: "Order not found." });
    res.json(await orders.findOne({ _id: new ObjectId(req.params.id) }));
  } catch (e) { res.status(500).json({ error: "Could not update order." }); }
});

app.delete("/api/orders/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid order ID." });
  try {
    const result = await orders.deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: "Order not found." });
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: "Could not delete order." }); }
});

app.get("/api/polishing", async (_req, res) => {
  try { res.json(await polishing.find({}).sort({ createdAt: -1 }).limit(300).toArray()); }
  catch (e) { res.status(500).json({ error: "Could not load polishing batches." }); }
});

app.post("/api/polishing", async (req, res) => {
  const { contractor, product, sentQty, sentUnit, receivedQty, receivedUnit, notes } = req.body || {};
  if (!String(contractor || "").trim() || !String(product || "").trim() || Number(sentQty) <= 0 || Number(receivedQty) < 0 || !sentUnit || !receivedUnit)
    return res.status(400).json({ error: "Contractor, product, valid quantities and units are required." });
  const batch = {
    contractor: String(contractor).trim(), product: String(product).trim(),
    sentQty: Number(sentQty), sentUnit: String(sentUnit), receivedQty: Number(receivedQty),
    receivedUnit: String(receivedUnit), notes: String(notes || "").trim(),
    createdAt: new Date()
  };
  try {
    const result = await polishing.insertOne(batch);
    res.status(201).json({ ...batch, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: "Could not save polishing batch." }); }
});

app.get("/api/reports", async (_req, res) => {
  try {
    const all = await orders.find({}).toArray();
    const byStatus = {};
    for (const s of STATUSES) byStatus[s] = all.filter(o => o.status === s).length;
    res.json({
      total: all.length,
      pending: all.filter(o => !["Dispatched", "Returned"].includes(o.status)).length,
      holds: all.filter(o => o.paymentHold || o.status === "On Hold").length,
      partial: all.filter(o => o.status === "Partially Dispatched").length,
      byStatus
    });
  } catch (e) { res.status(500).json({ error: "Could not generate reports." }); }
});

async function start() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env and configure MongoDB Atlas.");
    process.exit(1);
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  orders = db.collection("orders");
  polishing = db.collection("polishing_batches");
  await orders.createIndex({ orderNo: 1 }, { unique: true });
  await orders.createIndex({ customer: 1, status: 1 });
  await polishing.createIndex({ contractor: 1, createdAt: -1 });
  app.listen(PORT, () => console.log(`Order visibility MVP running on port ${PORT}`));
}
start().catch(err => { console.error("Startup failed:", err.message); process.exit(1); });
