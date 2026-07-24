# System Architecture

## Overview
MNFR Wholesale is a B2B ordering platform built using React and TypeScript. It uses Vite as the bundler and Tailwind CSS for styling. The application is divided into two primary interfaces:
1. **Retailer App (Frontend):** For wholesale buyers to browse catalogs and place orders.
2. **Business Portal (Admin):** For the MNFR operations team to manage inventory, process orders, and handle dispatch.

## Tech Stack
- **Framework:** React 18
- **Language:** TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Backend/DB:** Firebase Firestore (currently simulated with services)

## Folder Structure
- `/src/components/`: Reusable UI elements, layout components (Header, Footer), and domain-specific pieces (product cards, order rows).
- `/src/pages/`: Full route components representing individual screens for both Retailer and Admin apps.
- `/src/contexts/`: React Context providers for global state (Cart, Auth, Settings).
- `/src/services/`: Abstraction layer for data operations (Order, Inventory, Settings, Notifications).
- `/src/lib/`: Utilities and dummy data.
- `/src/types/`: TypeScript interfaces shared across the application.

## Key Design Patterns
- **Service Layer:** All data mutations (orders, inventory, notifications) pass through dedicated services (`orderService`, `inventoryService`, etc.) to separate business logic from UI components.
- **Context API:** Used for cross-cutting concerns like Authentication, Cart management, and Global Settings.
- **Optimistic UI & Toasts:** User actions provide immediate feedback via toast notifications.

## Data Models (Firestore Collections)
### `orders`
- **Fields:** `id`, `orderNumber`, `retailerId`, `items`, `status`, `fulfillmentStatus`, `statusHistory`, `internalNotes`, `createdAt`, `updatedAt`
- **Purpose:** Tracks wholesale requests and their lifecycle.

### `notifications`
- **Fields:** `id`, `userId`, `title`, `message`, `type`, `read`, `link`, `createdAt`
- **Purpose:** In-app alert system for order status changes, stock alerts, and new registrations.

### `system` (Settings)
- **Document:** `settings`
- **Fields:** `contact`, `social`, `storeInfo`, `inventory`
- **Purpose:** Global configuration and customizable text for the application.
