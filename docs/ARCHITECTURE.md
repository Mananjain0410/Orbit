# System Architecture

## Overview
The Wholesale Ordering Platform is a full-stack B2B ordering and management solution built with React and TypeScript. It uses Vite as the bundler and Tailwind CSS for styling, backed directly by Firebase (Authentication, App Check, Firestore, and Storage).

The application consists of two primary interfaces:
1. **Retailer App (Frontend):** For wholesale buyers to authenticate via real Phone OTP, browse catalog offerings, add items to cart, and place orders with instant account activation upon registration.
2. **Business Portal (Admin):** For administrators to manage inventory, update product/category master data, process and fulfill orders, and customize business branding.

## Tech Stack
- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v8
- **Icons:** Lucide React
- **Backend / Services:**
  - **Firebase Authentication:** Phone OTP for Retailers, Email/Password for Admins
  - **Firebase App Check:** reCAPTCHA Enterprise protection
  - **Cloud Firestore:** Real-time database (Default instance)
  - **Cloud Storage:** Media and product asset storage

## Folder Structure
- `/src/components/`: Reusable UI elements, layout components (Header, Footer, AdminSidebar), and domain components (ProductCard, StatusBadge).
- `/src/pages/`: Route components for Retailer and Admin views.
- `/src/contexts/`: React Context providers for global state (StoreContext, CartContext, RetailerAuthContext, AdminAuthContext, SettingsContext, MasterDataContext).
- `/src/services/`: Direct Firebase service layer (`orderService`, `inventoryService`, `retailerService`, `productService`, `settingsService`, `mediaService`, `auditLogService`).
- `/src/firebase/`: Centralized Firebase configuration (`config.ts`).
- `/src/types/`: Shared TypeScript interfaces and domain types.

## Key Design Patterns
- **Service Layer:** Data queries and mutations pass through modular service abstractions backed by Firestore collections.
- **Context API:** Manages global state including active session auth, store catalog, master attributes, and global cart/favorites.
- **Immediate Retailer Activation:** Newly registered retailers complete business onboarding and immediately gain access to catalog browsing and order placement.
- **UID-Based Authorization:** Firestore and Storage security rules enforce strict UID-based data access for retailers and explicit admin authorization for platform operations.

## Firestore Collections
- `products`: Catalog items, pattern numbers, pricing, sizes, and color selections.
- `categories`: Product categories, display images, and display ordering.
- `retailers`: Registered retailer profiles with owner, firm, location, and active status.
- `orders`: Wholesale order lifecycle records, status history, and items matrix.
- `savedCarts`: Persistent retailer carts and wishlists.
- `inventory`: Per-color stock availability, reserved stock, and stock levels.
- `master_colors`, `master_fabrics`, `master_fits`, `master_lengths`, `master_sizes`: Master attribute collections.
- `system`: App settings, business profile details, and website copy.
- `media`: Centralized media library records.
- `admins`: Admin user collection for platform authorization.
- `audit_logs`: Audit log entries for administrative operations.
