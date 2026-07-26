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
  homepage: {
    heroImages: string[];
    features: { title: string; desc: string; icon: string }[];
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
  homepage: {
    heroImages: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=2000"
    ],
    features: [
      { icon: "Leaf", title: "Premium Fabrics", desc: "We source only the highest grade cotton blends and technical fabrics." },
      { icon: "ShieldCheck", title: "Quality Assured", desc: "Multi-stage quality checks ensure zero defect rate in wholesale orders." },
      { icon: "TrendingUp", title: "Latest Designs", desc: "Our catalog updates monthly with market-researched trends." },
      { icon: "Factory", title: "Direct Manufacturing", desc: "No middlemen. Factory direct pricing ensures better margins for you." },
      { icon: "Truck", title: "Fast Dispatch", desc: "90% of wholesale orders are dispatched within 24 hours." },
      { icon: "CheckCircle2", title: "Comfort Fit", desc: "Patterns perfected over years for the ideal balance of style and comfort." }
    ]
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
