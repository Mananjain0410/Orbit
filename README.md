# Wholesale B2B Platform

A production-ready wholesale menswear B2B ordering platform featuring two integrated portals: a sleek Retailer App for browsing and instant order placement, and a comprehensive Business Management Portal for operations, inventory management, and fulfillment.

## Project Architecture

### 1. Retailer Application (Client-Facing)
The application verified retailers use to browse products, manage their cart, and review order history. Designed with a clean, high-contrast, modern aesthetic.

**Core Routes:**
- `/` - Homepage (Featured Products, Banners, Categories)
- `/login` - Firebase Phone Authentication & OTP Verification
- `/register` - First-time Retailer Profile Onboarding (Instant Activation)
- `/category/:slug` - Category Catalog Listing
- `/product/:id` - Product Details, Size/Color Matrix & Add to Cart
- `/cart` - Wholesale Cart
- `/checkout` - Order Request Checkout
- `/order-confirmation/:id` - Immediate Order Receipt & Summary
- `/profile` - Retailer Profile & Order History
- `/order/:id` - Individual Order Details, Timeline & Quick Reorder

### 2. Business Portal (Internal Admin)
A secure workspace for business administrators to manage inventory, process orders, upload media, and configure platform settings.

**Admin Routes:**
- `/admin/login` - Administrator Email Authentication
- `/admin/dashboard` - Metrics, Quick Actions & Recent Orders
- `/admin/orders` - Wholesale Order Management & Status Workflow
- `/admin/orders/:id` - Order Workspace, Fulfillment & Packing Slips
- `/admin/inventory` - Stock Control & Multi-Color Inventory Matrix
- `/admin/products` - Product Catalog CRUD & Size/Color Assignment
- `/admin/products/:id/edit` - Product Editor
- `/admin/categories` - Category Management
- `/admin/retailers` - Retailer Management & Order History
- `/admin/retailers/:id` - Detailed Retailer Profile
- `/admin/content` - Dynamic Homepage & Header Content
- `/admin/master-data` - Master Colors, Fabrics, Fits, Lengths & Sizes
- `/admin/business-profile` - Business Profile, Contact & GST Configuration
- `/admin/promotions` - Banners, Popups & Promotional Media
- `/admin/media` - Centralized Media Library
- `/admin/settings` - System Settings & Thresholds

## Global UI Systems

- **Toast Notifications:** `<ToastProvider>` provides real-time feedback across all actions.
- **Modal Library:** Reusable `<Modal>` component with accessible overlays and smooth motion transitions.
- **Loading States:** Standardized `<Spinner>` and `<Skeleton>` loaders for smooth asynchronous data fetching.
- **Form Controls:** Clean UI components (`Input`, `Button`, `Card`, `StatusBadge`) providing unified design tokens.

## Technology Stack

- **Frontend:** React 19 + Vite
- **Routing:** React Router v8
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Motion
- **Authentication:** Firebase Authentication (Phone OTP for Retailers, Email/Password for Admins)
- **App Integrity:** Firebase App Check (reCAPTCHA Enterprise)
- **Database:** Firebase Cloud Firestore (Default Database)
- **File Storage:** Firebase Storage
