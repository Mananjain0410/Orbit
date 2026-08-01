import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order, OrderStatus, FulfillmentStatus, OrderStatusHistory } from '../types';
import { notificationService } from './notificationService';

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status' | 'fulfillmentStatus' | 'statusHistory' | 'internalNotes'>): Promise<Order> {
    
    // Validations
    if (!orderData.retailerId) {
      throw new Error('Retailer ID is required.');
    }
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }
    for (const item of orderData.items) {
      if (!item.sets || item.sets <= 0) {
        throw new Error(`Invalid quantity for item ${item.patternNumber}.`);
      }
    }
    
    const ordersRef = collection(db, 'orders');
    const newDocRef = doc(ordersRef);
    
    // Generate Order Number
    const date = new Date();
    const yearStr = date.getFullYear().toString();
    
    // Find the latest order in the current year to generate sequential ID
    const q = query(
      collection(db, 'orders'),
      where('orderNumber', '>=', `ORD-${yearStr}-`),
      where('orderNumber', '<', `ORD-${yearStr}-\uf8ff`),
      orderBy('orderNumber', 'desc')
    );
    const qs = await getDocs(q);
    let sequenceNumber = 1;
    if (!qs.empty) {
      const latestOrderNumber = qs.docs[0].data().orderNumber as string;
      const match = latestOrderNumber.match(/-(\d+)$/);
      if (match) {
        sequenceNumber = parseInt(match[1], 10) + 1;
      }
    }
    const paddedSequence = sequenceNumber.toString().padStart(5, '0');
    const orderNumber = `ORD-${yearStr}-${paddedSequence}`;
    
    const now = Date.now();
    
    const initialHistory: OrderStatusHistory[] = [
      {
        previousStatus: null,
        newStatus: 'Pending',
        timestamp: now,
        user: orderData.retailerId,
        type: 'order'
      },
      {
        previousStatus: null,
        newStatus: 'Not Started',
        timestamp: now,
        user: orderData.retailerId,
        type: 'fulfillment'
      }
    ];

    const order: Order = {
      id: newDocRef.id,
      orderNumber,
      ...orderData,
      status: 'Pending',
      fulfillmentStatus: 'Not Started',
      statusHistory: initialHistory,
      internalNotes: '',
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(newDocRef, order);
    
    // Notify admin
    await notificationService.createNotification({
      userId: 'Admin',
      title: 'New Order Received',
      message: `Order ${orderNumber} received from ${orderData.firmName}.`,
      type: 'order',
      link: `/admin/orders/${order.id}`
    });
    
    return order;
  },

  async getRetailerOrders(retailerId: string): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('retailerId', '==', retailerId)
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    return orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  },

  subscribeToRetailerOrders(retailerId: string, callback: (orders: Order[]) => void): () => void {
    const q = query(
      collection(db, 'orders'),
      where('retailerId', '==', retailerId)
    );
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => doc.data() as Order);
        orders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        callback(orders);
      });
    });
    
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  },

  subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
    const docRef = doc(db, 'orders', orderId);
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as Order);
        } else {
          callback(null);
        }
      });
    });
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  },

  async getOrder(orderId: string): Promise<Order | null> {
    const docRef = doc(db, 'orders', orderId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as Order;
  },

  async getAllOrders(): Promise<Order[]> {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Order);
  },

  subscribeToAllOrders(callback: (orders: Order[]) => void): () => void {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as Order));
      });
    });
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  },

  async updateOrderStatus(orderId: string, oldStatus: OrderStatus, newStatus: OrderStatus, userId: string = 'Admin'): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    
    // Validate Transition
    const terminalStatuses = ['Cancelled', 'Rejected'];
    if (terminalStatuses.includes(oldStatus)) {
      throw new Error(`Cannot change status of a ${oldStatus} order.`);
    }

    // Handle Inventory Deduction/Restoration based on order status
    const { inventoryService } = await import('./inventoryService');
    
    if (newStatus === 'Confirmed') {
      const result = await inventoryService.deductInventoryTransaction(orderId, userId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to deduct inventory for order confirmation.');
      }
    } else if (['Pending', 'On Hold', 'Rejected', 'Cancelled'].includes(newStatus)) {
      const result = await inventoryService.restoreInventoryTransaction(orderId, userId);
      if (!result.success) {
        console.warn('Inventory restore warning:', result.error);
      }
    }

    const historyEntry: OrderStatusHistory = {
      previousStatus: oldStatus,
      newStatus,
      timestamp: Date.now(),
      user: userId,
      type: 'order'
    };
    await updateDoc(docRef, {
      status: newStatus,
      statusHistory: arrayUnion(historyEntry),
      updatedAt: Date.now()
    });
    
    // Send notification to retailer
    const orderDoc = await getDoc(docRef);
    if (orderDoc.exists()) {
      const order = orderDoc.data() as Order;
      let title = '';
      let message = '';
      
      switch (newStatus) {
        case 'Confirmed':
          title = 'Order Confirmed';
          message = `Your order ${order.orderNumber} has been confirmed.`;
          break;
        case 'On Hold':
          title = 'Order Placed On Hold';
          message = `Your order ${order.orderNumber} has been placed on hold.`;
          break;
        case 'Rejected':
        case 'Cancelled':
          title = 'Order Cancelled';
          message = `Your order ${order.orderNumber} has been cancelled/rejected.`;
          break;
        default:
          return;
      }
      
      await notificationService.createNotification({
        userId: order.retailerId,
        title,
        message,
        type: 'order',
        link: `/order/${order.id}`
      });
    }
  },
  
  async updateFulfillmentStatus(orderId: string, oldStatus: FulfillmentStatus, newStatus: FulfillmentStatus, userId: string = 'Admin'): Promise<void> {
    const docRef = doc(db, 'orders', orderId);

    const historyEntry: OrderStatusHistory = {
      previousStatus: oldStatus,
      newStatus,
      timestamp: Date.now(),
      user: userId,
      type: 'fulfillment'
    };
    await updateDoc(docRef, {
      fulfillmentStatus: newStatus,
      statusHistory: arrayUnion(historyEntry),
      updatedAt: Date.now()
    });
    
    // Send notification to retailer
    const orderDoc = await getDoc(docRef);
    if (orderDoc.exists()) {
      const order = orderDoc.data() as Order;
      let title = '';
      let message = '';
      
      switch (newStatus) {
        case 'Packed':
          title = 'Order Packed';
          message = `Your order ${order.orderNumber} has been packed.`;
          break;
        case 'Dispatched':
          title = 'Order Dispatched';
          message = `Your order ${order.orderNumber} has been dispatched.`;
          break;
        default:
          return;
      }
      
      await notificationService.createNotification({
        userId: order.retailerId,
        title,
        message,
        type: 'order',
        link: `/order/${order.id}`
      });
    }
  },

  async markInventoryDeducted(orderId: string, deducted: boolean, userId: string = 'Admin'): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      inventoryDeducted: deducted,
      updatedAt: Date.now()
    });
  },

  async updateInternalNotes(orderId: string, internalNotes: string): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      internalNotes,
      updatedAt: Date.now()
    });
  }
};
