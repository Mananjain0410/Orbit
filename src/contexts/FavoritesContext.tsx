import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

interface FavoritesContextType {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('b2b_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('b2b_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const addFavorite = useCallback((product: Product) => {
    if (!product || !product.id) return;
    setFavoriteIds(prev => prev.includes(product.id) ? prev : [...prev, product.id]);
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== productId));
  }, []);

  const isFavorite = useCallback((productId: string) => favoriteIds.includes(productId), [favoriteIds]);

  const { products } = useStore();
  const favorites = products.filter(p => favoriteIds.includes(p.id));

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
