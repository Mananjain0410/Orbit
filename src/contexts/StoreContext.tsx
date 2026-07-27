import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let productsLoaded = false;
    let categoriesLoaded = false;
    setIsLoading(true);

    const unsubProducts = productService.subscribeToAllProducts(false, (fetchedProducts) => {
      setProducts(fetchedProducts);
      productsLoaded = true;
      if (categoriesLoaded) setIsLoading(false);
    });

    const unsubCategories = categoryService.subscribeToAllCategories(false, (fetchedCategories) => {
      setCategories(fetchedCategories);
      categoriesLoaded = true;
      if (productsLoaded) setIsLoading(false);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  return (
    <StoreContext.Provider value={{ products, categories, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
