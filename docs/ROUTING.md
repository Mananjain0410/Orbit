# Application Routing

The application uses React Router v7.

## Retailer Routes
| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Homepage with hero banner and categories. |
| `/login` | `Login` | Mock OTP login screen. |
| `/category/:slug` | `CategoryView` | Displays products filtered by a category. |
| `/product/:id` | `ProductPage` | Individual product details, color selection, and "add to cart". |
| `/cart` | `Cart` | Review selected items and proceed to checkout. |
| `/checkout` | `Checkout` | Finalize order request details and submit. |
| `/profile` | `Profile` | Retailer business details and order history tab. |
| `/order/:id` | `OrderDetails` | View specific order details, timeline, and reorder. |

## Admin Routes (Business Portal)
All admin routes are nested under `/admin` and use a dedicated `AdminLayout` wrapper.

| Path | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboard` | High-level metrics (orders today, pending approvals, revenue). |
| `/admin/orders` | `AdminOrders` | List of all wholesale orders with status filters and Excel export. |
| `/admin/orders/:id` | `AdminOrderDetails` | Order workspace: update status, fulfillment, notes, and print. |
| `/admin/inventory` | `AdminInventory` | Manage stock levels and view low stock items. |
| `/admin/retailers` | `AdminRetailers` | Manage approved and pending retailer accounts. |
| `/admin/products` | `AdminProducts` | View and edit catalog products (patterns/fabrics). |
| `/admin/categories` | `AdminCategories` | Manage catalog categories. |
| `/admin/settings` | `AdminSettings` | Global configuration (contact info, homepage text, low stock limits). |
