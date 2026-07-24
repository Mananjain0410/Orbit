# Complete Testing Checklist

## Retailer Workflow
- [ ] **Authentication**
  - [ ] Can enter phone number and receive mock OTP.
  - [ ] Entering `123456` OTP successfully logs in and triggers Admin notification.
  - [ ] Logout works correctly and clears context.
- [ ] **Catalog & Discovery**
  - [ ] Homepage banner images rotate automatically.
  - [ ] Product categories display correctly.
  - [ ] Product search and filtering (by category) works on the catalog page.
  - [ ] Product detail page displays images, pricing, and available colors/stock.
- [ ] **Cart & Ordering**
  - [ ] Adding products to cart correctly updates global cart state.
  - [ ] Minimum order quantity validation works.
  - [ ] Cart page calculates estimated value and total sets correctly.
  - [ ] "Proceed to Request" generates an order.
  - [ ] Submitting an order triggers a notification to Admin.
- [ ] **Order History & Profile**
  - [ ] Profile page displays business details correctly.
  - [ ] "Order History" lists all past orders.
  - [ ] Order details page displays items and timeline accurately.
  - [ ] "Reorder" functionality successfully adds available items back to cart.
  - [ ] Retailer can cancel an order when it is in "Pending" status.

## Business Portal (Admin Workflow)
- [ ] **Order Management**
  - [ ] Admin can view all orders.
  - [ ] Filters (All, Reserved, Available) sort orders correctly based on inventory impact.
  - [ ] "Export to Excel" generates a downloadable file.
  - [ ] Order details page displays full breakdown, notes, and timeline.
- [ ] **Order Lifecycle & State Transitions**
  - [ ] Admin can change `OrderStatus` (Pending -> Confirmed -> On Hold -> Rejected/Cancelled).
  - [ ] Terminal states (Cancelled, Rejected) disable further `OrderStatus` changes.
  - [ ] Admin can change `FulfillmentStatus` (Not Started -> Picking -> Packed -> Ready for Dispatch -> Dispatched -> Delivered).
  - [ ] Changing `FulfillmentStatus` to "Packed" deducts inventory (unless already deducted).
  - [ ] Changing `OrderStatus` to "Cancelled" auto-restores inventory if it was previously deducted.
  - [ ] Terminal states disable further `FulfillmentStatus` changes.
  - [ ] Notifications are sent to the Retailer when order or fulfillment status changes.
- [ ] **Inventory Management**
  - [ ] Inventory dashboard correctly lists products and stock per color.
  - [ ] Low stock alert triggers when a deduction drops stock below the global threshold.
- [ ] **Global Settings**
  - [ ] Admin can update Business Profile, Website Settings, and Inventory Rules in the Settings dashboard.
  - [ ] Homepage and Footer text dynamically reflect the values from `SettingsContext`.

## Cross-cutting Concerns
- [ ] **Notifications**
  - [ ] Notification bell displays unread count.
  - [ ] Clicking notification bell marks unread notifications as read.
- [ ] **Performance**
  - [ ] Image loading is optimized.
  - [ ] Components load without excessive re-renders.
- [ ] **Security**
  - [ ] Route protection redirects unauthenticated users.
  - [ ] Mock Firestore rules restrict access based on roles.
