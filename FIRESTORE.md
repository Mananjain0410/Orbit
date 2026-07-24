# Firestore Database Structure

This document outlines the scalable Firestore collections required for the MNFR Clothing B2B application.

## Collections & Documents

### `users`
Stores all user profiles (retailers, admins).
- **Document ID:** Firebase Auth UID
- **Fields:**
  - `role`: string ('retailer', 'admin', 'super_admin')
  - `email`: string
  - `phone`: string
  - `firmName`: string (if retailer)
  - `gst`: string (if retailer)
  - `status`: string ('pending', 'active', 'suspended')
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

### `products`
Stores product inventory.
- **Document ID:** Auto-generated ID
- **Fields:**
  - `patternNumber`: string
  - `categoryId`: string
  - `description`: string
  - `fabric`: string
  - `fabricComposition`: string
  - `gsm`: number
  - `colors`: array of objects (name, hex)
  - `sizes`: array of strings
  - `price`: number
  - `moq`: number
  - `images`: array of strings (URLs)
  - `status`: string ('draft', 'published', 'archived')
  - `inventory`: map of color-size to stock quantity (e.g., `{'Red-M': 100}`)

### `categories`
Stores product categories.
- **Document ID:** string (slugified, e.g., 'lowers')
- **Fields:**
  - `name`: string
  - `description`: string
  - `bannerImage`: string
  - `status`: string ('active', 'inactive')
  - `order`: number

### `orders` (Phase 3)
Stores retailer orders.
- **Document ID:** Auto-generated ID
- **Fields:**
  - `retailerId`: string (UID)
  - `items`: array of objects (productId, color, size, quantity, price)
  - `totalAmount`: number
  - `status`: string ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
  - `createdAt`: timestamp
  - `shippingAddress`: object

### `settings`
Stores global application settings.
- **Document ID:** 'global'
- **Fields:**
  - `general`: object (appName, tagline, colors, timezone)
  - `business`: object (gst, address, contact, email)
  - `website`: object (homepage title, about, footer)
  - `inventory`: object (lowStockThreshold, outOfStockBehavior)

### `media`
Centralized media library tracking.
- **Document ID:** Auto-generated ID
- **Fields:**
  - `name`: string
  - `url`: string
  - `type`: string ('image', 'video')
  - `sizeBytes`: number
  - `uploadedBy`: string (UID)
  - `createdAt`: timestamp

## Security Rules (Proposed)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Functions
    function isAdmin() {
      return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    function isSuperAdmin() {
      return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users (Retailers only see their own, Admins see all)
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
    }

    // Products (Public read for active retailers, Admin full access)
    match /products/{productId} {
      allow read: if request.auth != null; // Refine to active retailers
      allow write: if isAdmin();
    }

    // Settings (Public read, SuperAdmin write)
    match /settings/{settingDoc} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }
  }
}
```
