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

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
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
  fabric: string;
  colors: ProductColor[];
  price: number;
  sizes: string[];
  images: string[];
  description?: string;
  inStock: boolean;
  keywords: string[];
  createdAt: number;
  updatedAt: number;
  status?: 'Published' | 'Draft' | 'Hidden';
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'On Hold' | 'Cancelled';
export type FulfillmentStatus = 'Not Started' | 'Picking' | 'Packed' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered';

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
