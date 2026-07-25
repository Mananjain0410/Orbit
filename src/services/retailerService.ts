import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface RetailerProfile {
  uid: string;
  ownerName: string;
  firmName: string;
  phone: string;
  gst?: string;
  address?: string;
  city: string;
  state: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: any;
  updatedAt: any;
}

export const retailerService = {
  async getRetailerByPhone(phone: string): Promise<RetailerProfile | null> {
    try {
      const retailersRef = collection(db, 'retailers');
      const q = query(retailersRef, where('phone', '==', phone));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { uid: doc.id, ...doc.data() } as RetailerProfile;
    } catch (error) {
      console.error('Error fetching retailer by phone:', error);
      throw error;
    }
  },

  async getRetailerById(uid: string): Promise<RetailerProfile | null> {
    try {
      const docRef = doc(db, 'retailers', uid);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return { uid: snapshot.id, ...snapshot.data() } as RetailerProfile;
    } catch (error) {
      console.error('Error fetching retailer by ID:', error);
      throw error;
    }
  },

  async createRetailer(uid: string, data: Omit<RetailerProfile, 'uid' | 'status' | 'createdAt' | 'updatedAt'>): Promise<RetailerProfile> {
    try {
      const docRef = doc(db, 'retailers', uid);
      const newRetailer = {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(docRef, newRetailer);
      
      return { uid, ...newRetailer } as RetailerProfile;
    } catch (error) {
      console.error('Error creating retailer:', error);
      throw error;
    }
  },

  async updateRetailerStatus(uid: string, status: 'active' | 'pending' | 'suspended'): Promise<void> {
    try {
      const docRef = doc(db, 'retailers', uid);
      await updateDoc(docRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating retailer status:', error);
      throw error;
    }
  },

  async getAllRetailers(): Promise<RetailerProfile[]> {
    try {
      const retailersRef = collection(db, 'retailers');
      const q = query(retailersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as RetailerProfile));
    } catch (error) {
      console.error('Error fetching all retailers:', error);
      throw error;
    }
  }
};
