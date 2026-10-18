# Wantace Order Visibility MVP

A mobile-friendly full-stack prototype inspired by the fictional Vardhan Steelware case in the Wantace Solutions Sprint assignment.

## What this demonstrates

- Central order register with generated order IDs
- Search by order number, customer or product
- Status tracking and pending-order overview
- Payment holds and blockers
- Partial dispatch quantity field
- Outsourced polishing batch log (quantity sent/received)
- Morning summary metrics and status-stage report
- MongoDB persistence and Render deployment configuration

**This is a prototype, not a verified implementation for Wantace or Vardhan Steelware.** The assignment does not require a software app. The assessment deliverables still require a real Part A audit, a four-page maximum requirements document, AE handoff, content grounded in your audit, and a five-minute video. The demo data and examples in this project are not client-confirmed facts.

## Tech stack

- Node.js + Express API
- MongoDB Atlas
- HTML, CSS and vanilla JavaScript frontend
- Render deployment

No AI API is required for the Phase 1 workflow. Do not add Groq just for the sake of using an API key: AI sales forecasting is explicitly a proposed Phase 1 exclusion in the preparation guide. No API key is embedded in this repository.

## Run locally (Windows / VS Code)

1. Install Node.js 20 or later.
2. Extract the ZIP and open this folder in VS Code.
3. Open a terminal in the project folder and run:

   ```bash
   npm install
   copy .env.example .env
   ```

4. Create a free MongoDB Atlas cluster, create a database user, and allow your development IP in Network Access.
5. Put the Atlas connection string in `.env` as `MONGODB_URI`. Replace username/password with your database user's credentials. URL-encode special characters in the password.
6. Keep `DB_NAME=wantace_order_tracker`.
7. Start the server:

   ```bash
   npm start
   ```

8. Open http://localhost:3000. Health check: http://localhost:3000/api/health.

## Deploy to Render + MongoDB Atlas

1. Push this folder to a new GitHub repository. Do not commit `.env`.
2. In MongoDB Atlas, create a production database user and configure Network Access. For a quick demo, Atlas allows `0.0.0.0/0`, but it exposes the database endpoint to all IPs; use a strong unique password and restrict access where practical.
3. In Render, choose **New → Blueprint** and connect the GitHub repository, or create a Node Web Service manually.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
   - Health-check path: `/api/health`
5. Add environment variables in Render:
   - `MONGODB_URI` = your Atlas connection string
   - `DB_NAME` = `wantace_order_tracker`
   Render sets `PORT` automatically.
6. Deploy, then open the Render URL and confirm `/api/health` returns `{"status":"ok","database":"connected"}`.
7. Test creating an order and a polishing batch, refresh the page, and confirm records persist.

Free-tier availability, sleep behaviour and quotas can change. Check the current Render and Atlas plan limits before relying on this for production.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Service/database health |
| GET | `/api/orders` | List/search/filter orders |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id` | Update status, dispatch quantity, hold, blocker |
| DELETE | `/api/orders/:id` | Delete order |
| GET | `/api/polishing` | List polishing batches |
| POST | `/api/polishing` | Create polishing batch |
| GET | `/api/reports` | Summary counts |

## Important limitations before production

- No authentication/role-based permissions; do not store real confidential client data.
- No audit trail, CSV export, notification system, payment processing, or marketplace integrations.
- Units sent and received can differ (for example kg vs pieces); do not calculate a numeric shortage across unlike units without a verified conversion rule.
- No automatic overdue calculation; confirm how due dates should work with the client.
- The prototype's order status and data model are recommendations, not approved client requirements.
- Add authentication, authorization, validation, backups, monitoring and security review before real business use.

## Suggested user demo

1. Create a distributor order.
2. Set status to **At Polishing** and record a blocker.
3. Add a polishing batch with sent/received quantities.
4. Update the order to **Partially Dispatched**.
5. Show the overview and explain how this addresses the owner's need to see where an order is stuck without calling multiple people.

## Assessment notes

Use the companion `assessment/` folder to prepare the written submission. Replace every Part A placeholder with real observations, exact quotes, permitted photos and your own process map. Parts C and D must be grounded in the actual audit. The AI note must accurately describe how you used tools and a real example of an error or generic output you corrected.
