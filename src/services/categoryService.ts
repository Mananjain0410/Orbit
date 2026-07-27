import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category } from '../types';

export const categoryService = {
  subscribeToAllCategories(includeHidden: boolean = false, callback: (categories: Category[]) => void): () => void {
    const categoriesRef = collection(db, 'categories');
    let q;
    if (!includeHidden) {
      q = query(categoriesRef, where('status', '==', 'Published'));
    } else {
      q = query(categoriesRef, orderBy('displayOrder', 'asc'));
    }
    
    let isSubscribed = true;
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(q, (snapshot) => {
        let categories = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Category));
        if (!includeHidden) {
          categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
        if (isSubscribed) callback(categories);
      });
    });
    
    return () => {
      isSubscribed = false;
      unsubscribe.then(unsub => unsub());
    };
  },

  async getAllCategories(includeHidden: boolean = false): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      let q;
      
      if (!includeHidden) {
        q = query(categoriesRef, where('status', '==', 'Published'));
      } else {
        q = query(categoriesRef, orderBy('displayOrder', 'asc'));
      }
      
      const snapshot = await getDocs(q);
      
      let categories = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Category));
      
      if (!includeHidden) {
        categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await this.getAllCategories(true);
      return categories.find(c => c.slug === slug) || null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  },

  async saveCategory(category: Partial<Category> & { id?: string }): Promise<Category> {
    try {
      const categoriesRef = collection(db, 'categories');
      const id = category.id || doc(categoriesRef).id;
      const docRef = doc(db, 'categories', id);
      
      if (category.id) {
        // Update
        const updateData = { ...category };
        delete updateData.id;
        await updateDoc(docRef, updateData);
        
        const snapshot = await getDoc(docRef);
        return { id, ...(snapshot.data() as any) } as Category;
      } else {
        // Create
        const newData = {
          ...category,
          status: category.status || 'Published',
        };
        await setDoc(docRef, newData);
        return { id, ...newData } as Category;
      }
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};
