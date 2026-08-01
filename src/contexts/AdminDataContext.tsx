import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { slugify } from '../lib/utils';

interface AdminDataContextType {
  products: Product[];
  categories: Category[];
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubProducts = productService.subscribeToAllProducts(true, (fetchedProducts) => {
      setProducts(fetchedProducts);
    });

    const unsubCategories = categoryService.subscribeToAllCategories(true, (fetchedCategories) => {
      setCategories(fetchedCategories);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const refreshData = async () => {
    // Left for compatibility, but subscriptions handle the actual data flow
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    await productService.saveProduct(product as Partial<Product>);
    await refreshData();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await productService.saveProduct({ id, ...updates });
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    await refreshData();
  };

  const bulkUpdateProducts = async (ids: string[], updates: Partial<Product>) => {
    // In a real app we'd use a batch write, but doing it in parallel is okay for now
    await Promise.all(ids.map(id => productService.saveProduct({ id, ...updates })));
    await refreshData();
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    await Promise.all(ids.map(id => productService.deleteProduct(id)));
    await refreshData();
  };

  const addCategory = async (category: Omit<Category, 'id' | 'slug'>) => {
    const slug = slugify(category.name);
    await categoryService.saveCategory({ ...category, slug });
    await refreshData();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const slug = updates.name ? slugify(updates.name) : updates.slug;
    await categoryService.saveCategory({ id, ...updates, ...(slug ? { slug } : {}) });
    await refreshData();
  };

  const deleteCategory = async (id: string) => {
    await categoryService.deleteCategory(id);
    await refreshData();
  };

  return (
    <AdminDataContext.Provider value={{
      products,
      categories,
      refreshData,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkUpdateProducts,
      bulkDeleteProducts,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
