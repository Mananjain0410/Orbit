import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MasterFabric, MasterColor, MasterFit, MasterLength, BusinessProfile } from '../types';

export const defaultBusinessProfile: BusinessProfile = {
  businessName: 'MNFR Clothing Pvt Ltd',
  brandName: 'MNFR Wholesale',
  gstNumber: '24AAACM1234F1Z2',
  udyamNumber: 'UDYAM-GJ-01-0012345',
  address: '123 Textile Hub, Ring Road',
  city: 'Surat',
  state: 'Gujarat',
  country: 'India',
  pinCode: '395002',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'wholesale@mnfr.in',
  supportEmail: 'support@mnfr.in',
  website: 'https://mnfr.in',
  instagram: 'https://instagram.com/mnfr_wholesale',
  facebook: 'https://facebook.com/mnfr_wholesale',
  copyrightText: '© 2026 MNFR Clothing. All rights reserved.',
  logoUrl: '',
  footerLogoUrl: '',
  updatedAt: Date.now()
};

// Initial Master Data Defaults for Seeding
const DEFAULT_FABRICS: Omit<MasterFabric, 'id'>[] = [
  { name: 'Slub Linen', description: 'Lightweight, breathable texture', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Cotton Lycra', description: '4-way stretch premium daily wear', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Imported Lycra', description: 'High-density stretch performance fabric', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Poly Spandex', description: 'Quick-dry activewear blend', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Loopknit Cotton', description: 'Heavyweight fleece knit for comfort', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
];

const DEFAULT_COLORS: Omit<MasterColor, 'id'>[] = [
  { name: 'Black', hexCode: '#000000', rgb: '0, 0, 0', displayOrder: 1, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Navy Blue', hexCode: '#000080', rgb: '0, 0, 128', displayOrder: 2, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Dark Grey', hexCode: '#333333', rgb: '51, 51, 51', displayOrder: 3, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Light Grey', hexCode: '#D3D3D3', rgb: '211, 211, 211', displayOrder: 4, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Beige', hexCode: '#F5F5DC', rgb: '245, 245, 220', displayOrder: 5, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Olive Green', hexCode: '#556B2F', rgb: '85, 107, 47', displayOrder: 6, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Maroon', hexCode: '#800000', rgb: '128, 0, 0', displayOrder: 7, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'White', hexCode: '#FFFFFF', rgb: '255, 255, 255', displayOrder: 8, isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
];

const DEFAULT_FITS: Omit<MasterFit, 'id'>[] = [
  { name: 'Regular Fit', description: 'Classic balanced cut', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Slim Fit', description: 'Modern tapered silhouette', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Relaxed Fit', description: 'Spacious loose comfort', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Straight Fit', description: 'Parallel drop from hip to hem', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Loose Fit', description: 'Oversized streetwear aesthetic', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
];

const DEFAULT_LENGTHS: Omit<MasterLength, 'id'>[] = [
  { name: 'Ankle Length', description: 'Full coverage to ankle bone', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Full Length', description: 'Standard full inseam', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Capri', description: '3/4 length below the knee', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Knee Length', description: 'Casual Bermuda cut at knee', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Mid Thigh', description: 'Short athletic cut', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
];

export const masterDataService = {
  // --- BUSINESS PROFILE ---
  async getBusinessProfile(): Promise<BusinessProfile> {
    const docRef = doc(db, 'system', 'business_profile');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, defaultBusinessProfile);
      return defaultBusinessProfile;
    }
    return { ...defaultBusinessProfile, ...snap.data() };
  },

  subscribeBusinessProfile(callback: (profile: BusinessProfile) => void) {
    const docRef = doc(db, 'system', 'business_profile');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({ ...defaultBusinessProfile, ...snap.data() });
      } else {
        callback(defaultBusinessProfile);
      }
    });
  },

  async updateBusinessProfile(profile: Partial<BusinessProfile>): Promise<void> {
    const docRef = doc(db, 'system', 'business_profile');
    const existing = await this.getBusinessProfile();
    const updated = {
      ...existing,
      ...profile,
      updatedAt: Date.now()
    };
    const cleanData = JSON.parse(JSON.stringify(updated));
    await setDoc(docRef, cleanData);
  },

  // --- FABRICS ---
  async getFabrics(): Promise<MasterFabric[]> {
    const colRef = collection(db, 'master_fabrics');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed default fabrics
      const seeded: MasterFabric[] = [];
      for (const item of DEFAULT_FABRICS) {
        const docRes = await addDoc(colRef, item);
        seeded.push({ id: docRes.id, ...item });
      }
      return seeded;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterFabric));
  },

  subscribeFabrics(callback: (fabrics: MasterFabric[]) => void) {
    const colRef = collection(db, 'master_fabrics');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        const seeded = await this.getFabrics();
        callback(seeded);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterFabric));
        callback(items);
      }
    });
  },

  async addFabric(fabric: { name: string; description?: string; isActive?: boolean }): Promise<MasterFabric> {
    const existing = await this.getFabrics();
    const normalizedNew = fabric.name.trim().toLowerCase();
    if (existing.some(f => f.name.trim().toLowerCase() === normalizedNew)) {
      throw new Error(`Fabric with name "${fabric.name.trim()}" already exists.`);
    }

    const colRef = collection(db, 'master_fabrics');
    const newItem = {
      name: fabric.name.trim(),
      description: fabric.description?.trim() || '',
      isActive: fabric.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const docRef = await addDoc(colRef, newItem);
    return { id: docRef.id, ...newItem };
  },

  async updateFabric(id: string, updates: Partial<MasterFabric>): Promise<void> {
    if (updates.name) {
      const existing = await this.getFabrics();
      const normalizedNew = updates.name.trim().toLowerCase();
      if (existing.some(f => f.id !== id && f.name.trim().toLowerCase() === normalizedNew)) {
        throw new Error(`Fabric with name "${updates.name.trim()}" already exists.`);
      }
    }
    const docRef = doc(db, 'master_fabrics', id);
    const cleanUpdates = JSON.parse(JSON.stringify({ ...updates, updatedAt: Date.now() }));
    await updateDoc(docRef, cleanUpdates);
  },

  async deleteFabric(id: string): Promise<void> {
    const docRef = doc(db, 'master_fabrics', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const fabricName = (snap.data().name || '').trim().toLowerCase();
      if (fabricName) {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const inUse = productsSnap.docs.some(d => {
          const p = d.data();
          return p.fabric && p.fabric.trim().toLowerCase() === fabricName;
        });
        if (inUse) {
          throw new Error('Cannot delete this fabric because it is used by existing products.');
        }
      }
    }
    await deleteDoc(docRef);
  },

  // --- COLORS ---
  async getColors(): Promise<MasterColor[]> {
    const colRef = collection(db, 'master_colors');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const seeded: MasterColor[] = [];
      for (const item of DEFAULT_COLORS) {
        const docRes = await addDoc(colRef, item);
        seeded.push({ id: docRes.id, ...item });
      }
      return seeded;
    }
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterColor));
    return items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  subscribeColors(callback: (colors: MasterColor[]) => void) {
    const colRef = collection(db, 'master_colors');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        const seeded = await this.getColors();
        callback(seeded);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterColor));
        items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        callback(items);
      }
    });
  },

  async addColor(color: { name: string; hexCode: string; rgb?: string; displayOrder?: number; isActive?: boolean }): Promise<MasterColor> {
    const existing = await this.getColors();
    const normalizedNew = color.name.trim().toLowerCase();
    if (existing.some(c => c.name.trim().toLowerCase() === normalizedNew)) {
      throw new Error(`Color with name "${color.name.trim()}" already exists.`);
    }

    const colRef = collection(db, 'master_colors');
    const newItem = {
      name: color.name.trim(),
      hexCode: color.hexCode.trim() || '#000000',
      rgb: color.rgb?.trim() || '0, 0, 0',
      displayOrder: color.displayOrder ?? (existing.length + 1),
      isActive: color.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const docRef = await addDoc(colRef, newItem);
    return { id: docRef.id, ...newItem };
  },

  async updateColor(id: string, updates: Partial<MasterColor>): Promise<void> {
    if (updates.name) {
      const existing = await this.getColors();
      const normalizedNew = updates.name.trim().toLowerCase();
      if (existing.some(c => c.id !== id && c.name.trim().toLowerCase() === normalizedNew)) {
        throw new Error(`Color with name "${updates.name.trim()}" already exists.`);
      }
    }
    const docRef = doc(db, 'master_colors', id);
    const cleanUpdates = JSON.parse(JSON.stringify({ ...updates, updatedAt: Date.now() }));
    await updateDoc(docRef, cleanUpdates);
  },

  async deleteColor(id: string): Promise<void> {
    const docRef = doc(db, 'master_colors', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const colorName = (snap.data().name || '').trim().toLowerCase();
      if (colorName) {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const inUse = productsSnap.docs.some(d => {
          const p = d.data();
          return Array.isArray(p.colors) && p.colors.some((c: any) => c.name && c.name.trim().toLowerCase() === colorName);
        });
        if (inUse) {
          throw new Error('Cannot delete this color because it is currently assigned to products.');
        }
      }
    }
    await deleteDoc(docRef);
  },

  // --- FITS ---
  async getFits(): Promise<MasterFit[]> {
    const colRef = collection(db, 'master_fits');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const seeded: MasterFit[] = [];
      for (const item of DEFAULT_FITS) {
        const docRes = await addDoc(colRef, item);
        seeded.push({ id: docRes.id, ...item });
      }
      return seeded;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterFit));
  },

  subscribeFits(callback: (fits: MasterFit[]) => void) {
    const colRef = collection(db, 'master_fits');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        const seeded = await this.getFits();
        callback(seeded);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterFit));
        callback(items);
      }
    });
  },

  async addFit(fit: { name: string; description?: string; isActive?: boolean }): Promise<MasterFit> {
    const existing = await this.getFits();
    const normalizedNew = fit.name.trim().toLowerCase();
    if (existing.some(f => f.name.trim().toLowerCase() === normalizedNew)) {
      throw new Error(`Fit with name "${fit.name.trim()}" already exists.`);
    }

    const colRef = collection(db, 'master_fits');
    const newItem = {
      name: fit.name.trim(),
      description: fit.description?.trim() || '',
      isActive: fit.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const docRef = await addDoc(colRef, newItem);
    return { id: docRef.id, ...newItem };
  },

  async updateFit(id: string, updates: Partial<MasterFit>): Promise<void> {
    if (updates.name) {
      const existing = await this.getFits();
      const normalizedNew = updates.name.trim().toLowerCase();
      if (existing.some(f => f.id !== id && f.name.trim().toLowerCase() === normalizedNew)) {
        throw new Error(`Fit with name "${updates.name.trim()}" already exists.`);
      }
    }
    const docRef = doc(db, 'master_fits', id);
    const cleanUpdates = JSON.parse(JSON.stringify({ ...updates, updatedAt: Date.now() }));
    await updateDoc(docRef, cleanUpdates);
  },

  async deleteFit(id: string): Promise<void> {
    const docRef = doc(db, 'master_fits', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const fitName = (snap.data().name || '').trim().toLowerCase();
      if (fitName) {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const inUse = productsSnap.docs.some(d => {
          const p = d.data();
          return p.fit && p.fit.trim().toLowerCase() === fitName;
        });
        if (inUse) {
          throw new Error('Cannot delete this fit because it is used by existing products.');
        }
      }
    }
    await deleteDoc(docRef);
  },

  // --- LENGTHS ---
  async getLengths(): Promise<MasterLength[]> {
    const colRef = collection(db, 'master_lengths');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const seeded: MasterLength[] = [];
      for (const item of DEFAULT_LENGTHS) {
        const docRes = await addDoc(colRef, item);
        seeded.push({ id: docRes.id, ...item });
      }
      return seeded;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterLength));
  },

  subscribeLengths(callback: (lengths: MasterLength[]) => void) {
    const colRef = collection(db, 'master_lengths');
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        const seeded = await this.getLengths();
        callback(seeded);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MasterLength));
        callback(items);
      }
    });
  },

  async addLength(length: { name: string; description?: string; isActive?: boolean }): Promise<MasterLength> {
    const existing = await this.getLengths();
    const normalizedNew = length.name.trim().toLowerCase();
    if (existing.some(l => l.name.trim().toLowerCase() === normalizedNew)) {
      throw new Error(`Length with name "${length.name.trim()}" already exists.`);
    }

    const colRef = collection(db, 'master_lengths');
    const newItem = {
      name: length.name.trim(),
      description: length.description?.trim() || '',
      isActive: length.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const docRef = await addDoc(colRef, newItem);
    return { id: docRef.id, ...newItem };
  },

  async updateLength(id: string, updates: Partial<MasterLength>): Promise<void> {
    if (updates.name) {
      const existing = await this.getLengths();
      const normalizedNew = updates.name.trim().toLowerCase();
      if (existing.some(l => l.id !== id && l.name.trim().toLowerCase() === normalizedNew)) {
        throw new Error(`Length with name "${updates.name.trim()}" already exists.`);
      }
    }
    const docRef = doc(db, 'master_lengths', id);
    const cleanUpdates = JSON.parse(JSON.stringify({ ...updates, updatedAt: Date.now() }));
    await updateDoc(docRef, cleanUpdates);
  },

  async deleteLength(id: string): Promise<void> {
    const docRef = doc(db, 'master_lengths', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const lengthName = (snap.data().name || '').trim().toLowerCase();
      if (lengthName) {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const inUse = productsSnap.docs.some(d => {
          const p = d.data();
          return p.length && p.length.trim().toLowerCase() === lengthName;
        });
        if (inUse) {
          throw new Error('Cannot delete this length because it is used by existing products.');
        }
      }
    }
    await deleteDoc(docRef);
  }
};
