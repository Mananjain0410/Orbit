import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';

export const productService = {
  subscribeToAllProducts(includeHidden: boolean = false, callback: (products: Product[]) => void): () => void {
    const productsRef = collection(db, 'products');
    let q;
    if (!includeHidden) {
      q = query(productsRef, where('status', '==', 'Published'));
    } else {
      q = query(productsRef, orderBy('createdAt', 'desc'));
    }
    
    let isSubscribed = true;
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(q, (snapshot) => {
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
        if (!includeHidden) {
          products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        if (isSubscribed) callback(products);
      });
    });
    
    return () => {
      isSubscribed = false;
      unsubscribe.then(unsub => unsub());
    };
  },

  async getAllProducts(includeHidden: boolean = false): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      let q;
      
      if (!includeHidden) {
        q = query(productsRef, where('status', '==', 'Published'));
      } else {
        q = query(productsRef, orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
      
      if (!includeHidden) {
        products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductsByCategory(categoryId: string, includeHidden: boolean = false): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      let q;
      if (!includeHidden) {
        q = query(productsRef, where('categoryId', '==', categoryId), where('status', '==', 'Published'));
      } else {
        q = query(productsRef, where('categoryId', '==', categoryId));
      }
      
      const snapshot = await getDocs(q);
      
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...(snapshot.data() as any) } as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async saveProduct(product: Partial<Product> & { id?: string }): Promise<Product> {
    try {
      const productsRef = collection(db, 'products');
      const id = product.id || doc(productsRef).id;
      const docRef = doc(db, 'products', id);
      
      const now = Date.now();
      
      if (product.id) {
        // Update
        const updateData = { ...product, updatedAt: now };
        delete updateData.id;
        await updateDoc(docRef, updateData);
        
        return this.getProductById(id) as Promise<Product>;
      } else {
        // Create
        const newData = {
          ...product,
          status: product.status || 'Draft',
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(docRef, newData);
        return { id, ...newData } as Product;
      }
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};
