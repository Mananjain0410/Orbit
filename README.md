# MNFR Clothing B2B Platform

A premium wholesale menswear B2B platform with two distinct halves: a sleek Retailer App for browsing and ordering, and a comprehensive Business Management Portal for internal administration.

## Project Architecture

### 1. Retailer Application (Client-Facing)
The application verified retailers use to browse products, manage their cart, and review order history. Designed with a brutalist, high-end monochrome aesthetic.

**Core Routes:**
- `/` - Homepage (Featured Products, Categories)
- `/login` - Retailer Authentication
- `/category/:slug` - Category Listing
- `/product/:id` - Product Details
- `/cart` - Wholesale Cart
- `/profile` - Retailer Profile & Order History

### 2. Business Portal (Internal Admin)
A secure workspace for MNFR staff to manage inventory, approve retailers, upload media, and configure platform settings.

**Admin Routes:**
- `/admin/login` - Admin Authentication
- `/admin/dashboard` - High-level metrics
- `/admin/products` - Product Catalog Management
- `/admin/products/:id/edit` - Product Editor
- `/admin/categories` - Category Management
- `/admin/inventory` - Stock Management & Bulk Editing
- `/admin/retailers` - Retailer Verification & Profiles
- `/admin/retailers/:id` - Individual Retailer Profile
- `/admin/media` - Centralized Media Library
- `/admin/content` - Website Content Management
- `/admin/promotions` - Banner & Popup Management
- `/admin/settings` - Global System Configuration

## Global UI Systems

To ensure consistency and maintainability, several global systems were implemented:

- **Toast Notifications:** `<ToastProvider>` provides simple success/error feedback (`src/components/ui/Toast.tsx`).
- **Modal Library:** Reusable `<Modal>` component with animation and accessibility support (`src/components/ui/Modal.tsx`).
- **Loading States:** Reusable `<Spinner>` and `<Skeleton>` loaders.
- **Form Components:** Standardized `Input`, `Button`, and custom form blocks used heavily throughout the admin panel.

## Technology Stack

- **Framework:** React 19 + Vite
- **Routing:** React Router v8
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Database (Prepared):** Firebase (Firestore) for persistent storage

## Phase 2 Completion Summary

During Phase 2, the Business Management Portal was fully realized.
- **Catalog Management:** Create, read, update, and delete flows for products and categories.
- **Inventory Engine:** Advanced table views for tracking color/size specific stock matrices.
- **Retailer CRM:** Onboarding and verification flows for new wholesale partners.
- **Media & Content:** Systems to update the primary website's banners, copy, and visual assets dynamically.
- **System Settings:** Centralized configuration for general, business, website, and inventory parameters.
- **Architectural Cleanup:** Establishment of reusable UI components and a scalable folder structure.

## Future Roadmap (Phase 3)

The following features have been intentionally reserved for Phase 3:
- Real order processing and cart checkout flow.
- Advanced Analytics dashboards with charts.
- Excel Export/Import capabilities for inventory.
- Real-time Notifications system.
- Integration with third-party ERPs (Tally) and Logistics (Delhivery).
