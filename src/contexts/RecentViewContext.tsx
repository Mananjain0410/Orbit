import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

interface RecentViewContextType {
  recentViews: Product[];
  addRecentView: (product: Product) => void;
}

const RecentViewContext = createContext<RecentViewContextType | undefined>(undefined);

export function RecentViewProvider({ children }: { children: React.ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mnfr_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mnfr_recent', JSON.stringify(recentIds));
  }, [recentIds]);

  const addRecentView = useCallback((product: Product) => {
    if (!product || !product.id) return;
    setRecentIds(prev => {
      if (prev[0] === product.id) return prev;
      const filtered = prev.filter(id => id !== product.id);
      return [product.id, ...filtered].slice(0, 10);
    });
  }, []);

  const { products } = useStore();
  const recentViews = recentIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => p !== undefined);

  return (
    <RecentViewContext.Provider value={{ recentViews, addRecentView }}>
      {children}
    </RecentViewContext.Provider>
  );
}

export function useRecentView() {
  const context = useContext(RecentViewContext);
  if (context === undefined) {
    throw new Error('useRecentView must be used within a RecentViewProvider');
  }
  return context;
}
