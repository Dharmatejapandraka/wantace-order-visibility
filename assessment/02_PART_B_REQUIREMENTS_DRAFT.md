# Part B — Vardhan Steelware Requirements Document (draft)

**Status:** Evidence-based draft for discussion. Recommendations and assumptions must be validated on the next client call.

## 1. Problem in the client's words

Suresh says the central issue is not order volume but visibility: “pata nahi chalta maal kahan atka hai.” When a customer asks for an update, he has to call Ramesh, because “Ramesh ki diary mein sab hai.” The earlier ERP was considered too complicated and was abandoned after three months.

## 2. What the supplied material shows

- Suresh estimates 60–70 orders per month, while Kunal says the actual count is higher; neither figure is verified by the sample sheet.
- Gupta Traders' 200-piece Kadai No.10 appears once as dispatched and once as pending with a “repeat msg?” note. This could be a duplicate or a legitimate repeat order; confirm before merging.
- Jain Crockery's 150-piece Kadhai No.10 appears on 2 and 4 September, with the later row noting it was sent again on WhatsApp. Confirm whether these are duplicate entries or separate orders.
- One 3 September row has no customer name for a 20-dozen Thali order.
- Verma Utensils has 180 kg of Kadhai recorded as pending with no rate and a note to confirm the rate.
- Sharma's glass order is held for old dues of ₹1.8 lakh; a later 20-set Patila order is also marked hold for payment.
- Mehra's Kadai order of 300 pieces was split into 180 dispatched and 120 remaining; later entries show the remaining quantity dispatched.
- The order sheet includes a return of -6 dozen glasses due to dents. Return handling needs a defined model.
- WhatsApp records say 420 kg went to contractor Pappu and 1,180 pieces came back; another message reports a 6 kg shortage. Kilograms and pieces cannot be directly reconciled without a confirmed conversion/yield rule.
- Ramesh asks whether a Bhagona order is listed twice; this is evidence of uncertainty, not proof of a duplicate.
- Kunal requests marketplace integration and AI sales prediction, while Suresh says online sales are under 5% of the business. Phase 1 should prioritise order visibility and adoption before advanced integrations.

## 3. Current process (to validate)

Distributor phone/WhatsApp or online order → Kunal records order in a Google Sheet → production / item availability → outsourced polishing → returned quantity/count/weight checked → packing → dispatch (possibly partial) → Munshi ji records accounts/payment details. Ramesh's diary and WhatsApp messages also carry operational status. Exact ownership and sequence need confirmation.

## 4. Proposed Phase 1 scope

### Include
- One central order register with a unique order ID and required customer/product/quantity/unit fields.
- Simple mobile-friendly order status view with last update and blocker.
- Pending, on-hold, partial-dispatch and return visibility.
- Dispatch entries that preserve original order quantity and record each dispatched quantity separately.
- Outsourced polishing batch log: contractor, batch/order reference, quantity sent, unit, quantity received, unit, dates and notes.
- Basic roles and permissions, after confirming who can create orders, update statuses and flag payment holds.
- Three daily reports: orders by stage/age; blocked/held orders; polishing sent/received exceptions.

### Explicitly out initially
- AI sales forecasting: the underlying order data is inconsistent and online sales are reported below 5%; validate data quality and business value first.
- Full ERP replacement and accounting ledger: Munshi ji uses Tally; integration needs discovery.
- Complex Amazon/Flipkart integrations: clarify current order volume and process before committing.
- Automated material-loss calculation across kg and piece units: define conversion/yield rules first.
- Payment processing: client says payments are not the main problem.

## 5. Suggested data model

| Entity | Key fields | Relationship |
|---|---|---|
| Customer | customer_id, name, contact, payment_hold_flag | One customer has many orders |
| Order | order_id, customer_id, created_at, due_date, status, blocker, source | One order has many items and dispatches |
| OrderItem | item_id, order_id, product, quantity, unit, rate | Belongs to one order |
| Dispatch | dispatch_id, order_id, quantity, unit, date, reference | One order can have multiple dispatches |
| Return | return_id, order_id, quantity, unit, reason, date, disposition | Linked to an order/dispatch |
| PolishingBatch | batch_id, contractor_id, order/item reference, sent_qty/unit, received_qty/unit, dates, notes | Tracks outsourced work |
| PaymentHold | hold_id, customer_id/order_id, reason, status, updated_by | Can block an order |
| User | user_id, name, role, active | Owns recorded updates |

Do not calculate cross-unit shortages until the client confirms conversion rules.

## 6. Users and mobile actions

- **Suresh (owner):** view order stage, delayed/blocked orders, payment holds and exceptions; read-only by default.
- **Kunal (order coordinator):** create and correct orders, confirm customer/product details, monitor duplicate candidates.
- **Ramesh (dispatch/operations):** update stages, record partial dispatches and note blockers with minimal typing.
- **Munshi ji (accounts):** flag payment holds, review returns and reconcile financial records; avoid replacing Tally in Phase 1.
- **Polishing contractors:** do not assume direct login is required; confirm whether staff will record both dispatch and receipt.

## 7. Three morning reports

1. **Orders by stage and age:** order/customer, current stage, days at stage, due date, next owner.
2. **Blocked orders:** payment holds, missing customer/rate, pending polishing, overdue dispatch and responsible person.
3. **Polishing reconciliation exceptions:** batch, contractor, quantity sent/received, units, missing receipt and unresolved discrepancy.

## 8. Questions for the next call

1. Suresh: What exact information must appear on your phone to answer a distributor in under a minute?
2. Suresh: Who approves payment holds and can an order proceed with partial payment?
3. Kunal: What is the true monthly order count, and what are the source channels?
4. Kunal: How should repeat orders and corrected entries be distinguished from duplicates?
5. Ramesh: Walk us through one recent order, including partial dispatch and who updates each stage.
6. Ramesh: What status vocabulary would be easiest to update on a phone?
7. Munshi ji: How are returns, old dues and payment holds represented in Tally today?
8. Munshi ji: Which quantity and rate fields are mandatory before dispatch or invoicing?
9. Kunal + Ramesh: How are contractor material weights, piece counts and shortages verified?
10. All actual users: What made the previous ERP too complicated, and what would make a new system usable daily?

## 9. Biggest risk and mitigation

**Risk:** Low adoption by dispatch and shop-floor users, given that the previous ERP was abandoned because it was complicated. **Mitigation:** co-design the workflow with Ramesh and accounts, use a mobile-first screen with minimal required fields, pilot with a small set of orders, measure whether staff update statuses consistently, and only then expand scope.
