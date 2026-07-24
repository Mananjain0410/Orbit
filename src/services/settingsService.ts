import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface AppSettings {
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
  storeInfo: {
    name: string;
    tagline: string;
    aboutText: string;
    footerText: string;
  };
  inventory: {
    lowStockThreshold: number;
    outOfStockBehavior: 'Show as Sold Out' | 'Hide completely' | 'Allow backorders';
  };
}

export const defaultSettings: AppSettings = {
  contact: {
    email: 'wholesale@mnfr.in',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: '123 Textile Hub, Ring Road, Surat, Gujarat 395002',
  },
  social: {
    instagram: 'https://instagram.com/mnfr_wholesale',
    facebook: 'https://facebook.com/mnfr_wholesale',
  },
  storeInfo: {
    name: 'MNFR Wholesale',
    tagline: 'Premium B2B Apparel',
    aboutText: 'Leading manufacturer and wholesaler of premium men\'s lowers, trackpants, and casual wear.',
    footerText: '© 2026 MNFR Clothing. All rights reserved.',
  },
  inventory: {
    lowStockThreshold: 10,
    outOfStockBehavior: 'Show as Sold Out',
  },
};

export const settingsService = {
  // Get settings once
  async getSettings(): Promise<AppSettings> {
    const docRef = doc(db, 'system', 'settings');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    }
    return snapshot.data() as AppSettings;
  },

  // Listen for changes
  subscribeToSettings(callback: (settings: AppSettings) => void) {
    const docRef = doc(db, 'system', 'settings');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as AppSettings);
      } else {
        callback(defaultSettings);
      }
    });
  },

  // Update settings
  async updateSettings(settings: AppSettings): Promise<void> {
    const docRef = doc(db, 'system', 'settings');
    await setDoc(docRef, settings);
  }
};
