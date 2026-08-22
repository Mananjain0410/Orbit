import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types';
import { inventoryService } from './inventoryService';
import { categoryService } from './categoryService';
import { uploadService } from './uploadService';

export const productService = {
  subscribeToAllProducts(includeHidden: boolean = false, callback: (products: Product[]) => void): () => void {
    const productsRef = collection(db, 'products');
    let isSubscribed = true;
    
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(productsRef, (snapshot) => {
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
        
        if (!includeHidden) {
          products = products.filter(p => p.status === 'Published');
        } else {
          products = products.filter(p => p.status !== 'Archived');
        }
        
        products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (isSubscribed) callback(products);
      }, (error) => {
        console.warn('Error subscribing to products:', error);
        if (isSubscribed) callback([]);
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
      const snapshot = await getDocs(productsRef);
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
      
      if (!includeHidden) {
        products = products.filter(p => p.status === 'Published');
      } else {
        products = products.filter(p => p.status !== 'Archived');
      }
      
      products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductsByCategory(categoryId: string, includeHidden: boolean = false): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts(includeHidden);
      return allProducts.filter(p => p.categoryId === categoryId || p.categoryName === categoryId);
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
      let categoryName = product.categoryName;
      if (!categoryName && product.categoryId) {
        try {
          const categories = await categoryService.getAllCategories(true);
          const matchedCat = categories.find(c => c.id === product.categoryId);
          if (matchedCat) categoryName = matchedCat.name;
        } catch (e) {
          console.warn('Could not fetch category name for product', e);
        }
      }
      
      let savedProduct: Product;
      
      if (product.id) {
        // Update
        const updateData: any = { 
          ...product, 
          updatedAt: now 
        };
        if (categoryName) updateData.categoryName = categoryName;
        delete updateData.id;
        
        await updateDoc(docRef, updateData);
        savedProduct = (await this.getProductById(id)) as Product;
      } else {
        // Create
        const newData: any = {
          ...product,
          status: product.status || 'Draft',
          createdAt: now,
          updatedAt: now,
        };
        if (categoryName) newData.categoryName = categoryName;
        
        await setDoc(docRef, newData);
        savedProduct = { id, ...newData } as Product;
      }

      // Automatically initialize inventory records in Firestore per color
      if (savedProduct && savedProduct.colors) {
        await inventoryService.initializeProductInventory(savedProduct);
      }
      
      return savedProduct;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      // 1. Fetch product document
      const product = await this.getProductById(id);
      
      if (product) {
        // 2. Clean up product images from Firebase Storage
        if (Array.isArray(product.images)) {
          for (const imgUrl of product.images) {
            if (imgUrl) {
              try {
                await uploadService.deleteImage(imgUrl);
              } catch (e) {
                console.warn('Failed to delete product image from storage:', imgUrl, e);
              }
            }
          }
        }

        // 3. Clean up related inventory documents in Firestore
        try {
          const inventoryRef = collection(db, 'inventory');
          const q = query(inventoryRef, where('productId', '==', id));
          const invSnap = await getDocs(q);
          for (const invDoc of invSnap.docs) {
            await deleteDoc(doc(db, 'inventory', invDoc.id));
          }
        } catch (invErr) {
          console.warn('Failed to clean up product inventory records:', invErr);
        }
      }

      // 4. Delete product document from Firestore
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};
