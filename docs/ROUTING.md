# Application Routing

The application uses React Router v8.

## Retailer Routes
| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Homepage featuring banners, category grids, and featured items. |
| `/login` | `Login` | Firebase Phone Authentication OTP login screen. |
| `/register` | `Register` | Retailer business onboarding form (instant active status). |
| `/category/:slug` | `CategoryPage` | Products filtered by category. |
| `/product/:id` | `ProductPage` | Detailed product view with size/color matrix and add-to-cart. |
| `/cart` | `Cart` | Review selected items, quantities, and proceed to checkout. |
| `/checkout` | `Checkout` | Finalize order request details and submit. |
| `/order-confirmation/:id` | `OrderConfirmation` | Order submission receipt. |
| `/profile` | `Profile` | Retailer business profile and order history tab. |
| `/order/:id` | `OrderDetails` | Individual order details, fulfillment status, and quick reorder. |

## Admin Routes (Business Portal)
All admin routes are nested under `/admin` and wrapped in `AdminLayout`.

| Path | Component | Description |
|---|---|---|
| `/admin/login` | `AdminLogin` | Administrator email/password authentication. |
| `/admin/dashboard` | `AdminDashboard` | High-level metrics, pending orders count, and quick stats. |
| `/admin/orders` | `AdminOrders` | Wholesale order management with status filtering and Excel export. |
| `/admin/orders/:id` | `AdminOrderDetails` | Order workspace: update status, fulfillment, notes, and packing slip. |
| `/admin/inventory` | `AdminInventory` | Manage stock levels and color-wise inventory matrix. |
| `/admin/retailers` | `AdminRetailers` | View registered retailer profiles and status. |
| `/admin/retailers/:id` | `AdminRetailerProfile` | Individual retailer profile, contact info, and past order history. |
| `/admin/products` | `AdminProducts` | View and edit catalog products. |
| `/admin/products/:id/edit` | `AdminProductEdit` | Product editor for sizes, colors, pricing, and images. |
| `/admin/categories` | `AdminCategories` | Manage catalog categories. |
| `/admin/content` | `AdminContent` | Dynamic homepage and header content management. |
| `/admin/master-data` | `AdminMasterData` | Manage master colors, fabrics, fits, lengths, and sizes. |
| `/admin/business-profile` | `AdminBusinessProfile` | Manage business contact details, GST, and branding. |
| `/admin/promotions` | `AdminPromotions` | Manage promotional banners and popups. |
| `/admin/media` | `AdminMediaLibrary` | Centralized media library and image uploads. |
| `/admin/settings` | `AdminSettings` | Global system settings and inventory thresholds. |
