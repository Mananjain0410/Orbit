import { collection, doc, setDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartItem } from '../contexts/CartContext';

export interface SavedCartItem {
  productId: string;
  patternNumber: string;
  fabric: string;
  price: number;
  image: string;
  sizes: string[];
  selections: {
    name: string;
    hex: string;
    quantity: number;
  }[];
}

export interface SavedCart {
  id: string;
  retailerId: string;
  name: string;
  items: SavedCartItem[];
  totalSets: number;
  totalPrice: number;
  createdAt: number;
  updatedAt: number;
}

export const savedCartService = {
  async saveCart(retailerId: string, name: string, cartItems: CartItem[]): Promise<SavedCart> {
    if (!retailerId) throw new Error('Retailer ID is required.');
    if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty.');

    const savedCartsRef = collection(db, 'savedCarts');
    const newDocRef = doc(savedCartsRef);
    const now = Date.now();

    const formattedItems: SavedCartItem[] = cartItems.map(item => ({
      productId: item.product.id,
      patternNumber: item.product.patternNumber || '',
      fabric: item.product.fabric || '',
      price: item.product.price || 0,
      image: item.product.images?.[0] || '',
      sizes: item.product.sizes || [],
      selections: item.selections.map(s => ({
        name: s.name,
        hex: s.hex,
        quantity: s.quantity
      }))
    }));

    const totalSets = cartItems.reduce((acc, item) => acc + item.selections.reduce((sum, sel) => sum + sel.quantity, 0), 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.selections.reduce((sum, sel) => sum + sel.quantity, 0) * (item.product.price || 0)), 0);

    const savedCart: SavedCart = {
      id: newDocRef.id,
      retailerId,
      name: name.trim() || `Saved Cart - ${new Date().toLocaleDateString()}`,
      items: formattedItems,
      totalSets,
      totalPrice,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(newDocRef, savedCart);
    return savedCart;
  },

  async getSavedCarts(retailerId: string): Promise<SavedCart[]> {
    if (!retailerId) return [];
    const q = query(collection(db, 'savedCarts'), where('retailerId', '==', retailerId));
    const snapshot = await getDocs(q);
    const carts = snapshot.docs.map(doc => doc.data() as SavedCart);
    return carts.sort((a, b) => b.createdAt - a.createdAt);
  },

  subscribeToSavedCarts(retailerId: string, callback: (carts: SavedCart[]) => void): () => void {
    if (!retailerId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, 'savedCarts'), where('retailerId', '==', retailerId));
    let isSubscribed = true;

    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(q, (snapshot) => {
        const carts = snapshot.docs.map(doc => doc.data() as SavedCart);
        carts.sort((a, b) => b.createdAt - a.createdAt);
        if (isSubscribed) callback(carts);
      });
    });

    return () => {
      isSubscribed = false;
      unsubscribe.then(unsub => unsub && unsub());
    };
  },

  async updateSavedCartName(cartId: string, newName: string): Promise<void> {
    const docRef = doc(db, 'savedCarts', cartId);
    await updateDoc(docRef, {
      name: newName.trim(),
      updatedAt: Date.now()
    });
  },

  async renameSavedCart(cartId: string, newName: string): Promise<void> {
    return this.updateSavedCartName(cartId, newName);
  },

  async deleteSavedCart(cartId: string): Promise<void> {
    const docRef = doc(db, 'savedCarts', cartId);
    await deleteDoc(docRef);
  }
};
