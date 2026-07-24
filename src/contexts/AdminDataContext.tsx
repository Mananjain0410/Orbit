import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { dummyProducts, dummyCategories } from '../lib/dummyData';

interface AdminDataContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Load initial data
    setProducts(dummyProducts.map(p => ({ ...p, status: p.status || 'Published' })));
    setCategories(dummyCategories.map((c, i) => ({ ...c, status: 'Published', displayOrder: i })));
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: product.status || 'Draft',
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates, updatedAt: Date.now() } : p));
  };

  const bulkDeleteProducts = (ids: string[]) => {
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  };

  const addCategory = (category: Omit<Category, 'id' | 'slug'>) => {
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory: Category = {
      ...category,
      id: `c-${Date.now()}`,
      slug,
      status: category.status || 'Published',
      displayOrder: category.displayOrder || categories.length,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AdminDataContext.Provider value={{
      products,
      categories,
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
