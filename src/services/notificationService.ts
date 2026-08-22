import { collection, query, where, getDocs, addDoc, updateDoc, doc, writeBatch, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppNotification } from '../types';

export const notificationService = {
  // Subscribe to unread notifications count for a user (real-time)
  subscribeToUnreadCount(userId: string, callback: (count: number) => void) {
    if (!userId) {
      callback(0);
      return () => {};
    }
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.size);
    }, (error) => {
      console.warn('Error subscribing to unread count:', error);
      callback(0);
    });
  },

  // Subscribe to all notifications for a user (real-time)
  subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
    if (!userId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      callback(notifications);
    }, (error) => {
      console.warn('Error subscribing to notifications:', error);
      callback([]);
    });
  },

  // Fetch notifications (one-time)
  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AppNotification[];
  },

  // Mark a single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => {
      batch.update(document.ref, { read: true });
    });
    
    await batch.commit();
  },

  // Create a new notification
  async createNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: Date.now()
    });
    return docRef.id;
  }
};
