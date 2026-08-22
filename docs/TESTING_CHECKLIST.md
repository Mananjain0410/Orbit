# Complete Testing Checklist

## Retailer Workflow
- [ ] **Authentication & Onboarding**
  - [ ] Can enter phone number and receive OTP via Firebase Phone Authentication.
  - [ ] Valid OTP logs in user and redirects to registration if new user, or home if existing.
  - [ ] Completing registration instantly creates an active profile without requiring admin approval.
  - [ ] Logout works correctly and clears session context.
- [ ] **Catalog & Discovery**
  - [ ] Homepage hero banners and categories load dynamically.
  - [ ] Product categories filter catalog items correctly.
  - [ ] Product detail page displays accurate pricing, size matrix, and color stock options.
- [ ] **Cart & Ordering**
  - [ ] Adding color selections to cart updates global cart state and localStorage.
  - [ ] Cart page calculates total sets and estimated order value.
  - [ ] Checkout submits order directly to Firestore `orders` collection.
  - [ ] Order confirmation page displays receipt details upon completion.
- [ ] **Order History & Reordering**
  - [ ] Profile page shows active retailer business details and order history.
  - [ ] Order details page displays status timeline, items breakdown, and fulfillment tracking.
  - [ ] "Reorder" button re-populates cart with available items.

## Business Portal (Admin Workflow)
- [ ] **Authentication & Security**
  - [ ] Administrator login using email and password.
  - [ ] Protected admin routes redirect unauthenticated visitors.
  - [ ] Firestore and Storage security rules enforce UID/admin authorization.
- [ ] **Order Management & Fulfillment**
  - [ ] Admin dashboard displays order metrics and recent activity.
  - [ ] Orders list allows filtering by status (Pending, Confirmed, On Hold, Rejected, Cancelled).
  - [ ] Order details view allows changing Order Status and Fulfillment Status.
  - [ ] Changing order status to Confirmed/Packed updates inventory deductions cleanly.
  - [ ] Printable order invoice and packing sheet render formatted print view.
  - [ ] Excel export downloads order records.
- [ ] **Inventory & Catalog Management**
  - [ ] Inventory matrix displays stock levels across product color variants.
  - [ ] Stock adjustments update real-time Firestore records.
  - [ ] Product CRUD allows managing pattern numbers, prices, sizes, and images.
  - [ ] Category CRUD updates category listings across retailer app.
  - [ ] Master Data CRUD manages colors, fabrics, fits, lengths, and sizes.
- [ ] **Content & Business Profile**
  - [ ] Business Profile updates company contact info, GST, and brand details.
  - [ ] Website Content and Promotions allow managing hero banners and dynamic text.
  - [ ] Centralized Media Library handles asset uploads to Firebase Storage.

## System & App Integration
- [ ] **App Check & Infrastructure**
  - [ ] Firebase App Check initializes with reCAPTCHA Enterprise provider.
  - [ ] Firestore Security Rules enforce deny-by-default with strict role permissions.
  - [ ] Storage Security Rules restrict write operations to authenticated admins.
  - [ ] Production build (`npm run build`) completes with zero errors or broken imports.
