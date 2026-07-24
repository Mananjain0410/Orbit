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
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const idSuffix = newDocRef.id.slice(-5).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${idSuffix}`;
    
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
      where('retailerId', '==', retailerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Order);
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

  async updateOrderStatus(orderId: string, oldStatus: OrderStatus, newStatus: OrderStatus, userId: string = 'Admin'): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    
    // Validate Transition
    const terminalStatuses = ['Cancelled', 'Rejected'];
    if (terminalStatuses.includes(oldStatus)) {
      throw new Error(`Cannot change status of a ${oldStatus} order.`);
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
          return; // No notification for other generic updates
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

    // Validate Transition
    if (oldStatus === 'Delivered') {
      throw new Error(`Cannot change fulfillment status of a Delivered order.`);
    }

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
        case 'Ready for Dispatch':
          title = 'Order Ready for Dispatch';
          message = `Your order ${order.orderNumber} is ready for dispatch.`;
          break;
        case 'Dispatched':
          title = 'Order Dispatched';
          message = `Your order ${order.orderNumber} has been dispatched.`;
          break;
        case 'Delivered':
          title = 'Order Delivered';
          message = `Your order ${order.orderNumber} has been delivered.`;
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
