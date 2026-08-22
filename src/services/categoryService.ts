import { collection, doc, setDoc, getDoc, getDocs, query, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category } from '../types';
import { slugify } from '../lib/utils';

import { uploadService } from './uploadService';

export const categoryService = {
  subscribeToAllCategories(includeHidden: boolean = false, callback: (categories: Category[]) => void): () => void {
    const categoriesRef = collection(db, 'categories');
    let q;
    if (!includeHidden) {
      q = query(categoriesRef, where('status', '==', 'Published'));
    } else {
      q = categoriesRef as any;
    }
    
    let isSubscribed = true;
    const unsubscribe = import('firebase/firestore').then(({ onSnapshot }) => {
      return onSnapshot(q, (snapshot: any) => {
        let categories = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          const name = data.name || 'Category';
          const computedSlug = slugify(name);
          // Fix slug in memory if missing or mismatched
          const slug = data.slug && data.slug !== 'lowers' || name.toLowerCase() === 'lowers' ? data.slug : computedSlug;
          return { id: doc.id, ...data, slug } as Category;
        });
        categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        if (isSubscribed) callback(categories);
      }, (error: any) => {
        console.warn('Error subscribing to categories:', error);
        if (isSubscribed) callback([]);
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
        q = categoriesRef as any;
      }
      
      const snapshot = await getDocs(q);
      
      let categories = snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        const name = data.name || 'Category';
        const computedSlug = slugify(name);
        const slug = data.slug && data.slug !== 'lowers' || name.toLowerCase() === 'lowers' ? data.slug : computedSlug;
        return { id: doc.id, ...data, slug } as Category;
      });
      
      categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await this.getAllCategories(true);
      return categories.find(c => c.slug === slug || slugify(c.name) === slug) || null;
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
      
      const categoryName = category.name || 'Category';
      const slug = category.slug && category.slug !== 'lowers' || categoryName.toLowerCase() === 'lowers' 
        ? category.slug 
        : slugify(categoryName);

      if (category.id) {
        // Update
        const updateData = { ...category, slug };
        delete updateData.id;
        await updateDoc(docRef, updateData);
        
        const snapshot = await getDoc(docRef);
        return { id, ...(snapshot.data() as any), slug } as Category;
      } else {
        // Create
        const newData = {
          ...category,
          slug,
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
      // 1. Fetch category doc to check details and image URLs
      const catRef = doc(db, 'categories', id);
      const catSnap = await getDoc(catRef);
      if (!catSnap.exists()) return;
      const catData = catSnap.data() as Category;

      // 2. Dependency check: check if any products are assigned to this category
      const productsRef = collection(db, 'products');
      const qById = query(productsRef, where('categoryId', '==', id));
      const productsSnap = await getDocs(qById);

      let isAssigned = !productsSnap.empty;
      if (!isAssigned && catData.name) {
        const qByName = query(productsRef, where('categoryName', '==', catData.name));
        const productsByNameSnap = await getDocs(qByName);
        if (!productsByNameSnap.empty) {
          isAssigned = true;
        }
      }

      if (isAssigned) {
        throw new Error('Cannot delete this category because products are assigned to it.');
      }

      // 3. Clean up image files from Firebase Storage if present
      const imagesToDelete = [catData.image, catData.thumbnail, (catData as any).displayImage, (catData as any).mobileImage].filter(Boolean) as string[];
      for (const imgUrl of imagesToDelete) {
        try {
          await uploadService.deleteImage(imgUrl);
        } catch (e) {
          console.warn('Failed to delete image from storage:', imgUrl, e);
        }
      }

      // 4. Delete the category document
      await deleteDoc(catRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};
