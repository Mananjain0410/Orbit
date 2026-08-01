export type Role = 'retailer' | 'admin';

export interface User {
  uid: string;
  ownerName: string;
  firmName: string;
  phone: string;
  gst?: string;
  city: string;
  state: string;
  role: Role;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'pending' | 'suspended';
}

export type Retailer = User;

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  thumbnail?: string;
  displayImage?: string;
  mobileImage?: string;
  description?: string;
  displayOrder?: number;
  status?: 'Published' | 'Hidden';
}

export interface ProductColor {
  name: string;
  hex: string;
  stock?: number;
}

export interface Product {
  id: string;
  patternNumber: string;
  categoryId: string;
  categoryName?: string;
  fabric: string;
  fit?: string;
  length?: string;
  colors: ProductColor[];
  price: number;
  sizes: string[];
  images: string[];
  description?: string;
  inStock: boolean;
  keywords: string[];
  createdAt: number;
  updatedAt: number;
  status?: 'Published' | 'Draft' | 'Hidden' | 'Archived';
  openingInventory?: Record<string, number>;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  patternNumber: string;
  color: string;
  hex: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  createdAt: number;
  updatedAt: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'On Hold' | 'Cancelled';
export type FulfillmentStatus = 'Not Started' | 'Partial Fulfillment' | 'Packed' | 'Dispatched' | 'Delivered';

export interface OrderStatusHistory {
  previousStatus: OrderStatus | FulfillmentStatus | null;
  newStatus: OrderStatus | FulfillmentStatus;
  timestamp: number;
  user: string;
  type: 'order' | 'fulfillment';
}

export interface OrderItem {
  productId: string;
  patternNumber: string;
  color: string;
  hex: string;
  sets: number;
  fulfilledSets?: number;
  pendingSets?: number;
  unfulfilledReason?: string;
  sizes: string[];
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  retailerId: string;
  firmName: string;
  ownerName: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  statusHistory: OrderStatusHistory[];
  inventoryDeducted?: boolean;
  isPartialFulfillment?: boolean;
  totalProducts: number;
  totalColors: number;
  totalSets: number;
  estimatedValue: number;
  retailerNotes: string;
  internalNotes: string;
  items: OrderItem[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'system' | 'account';
  read: boolean;
  createdAt: number;
  link?: string;
}
