import React, { createContext, useContext, useState, useEffect } from 'react';
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
      const saved = localStorage.getItem('mnfr_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mnfr_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const addFavorite = (product: Product) => {
    setFavoriteIds(prev => prev.includes(product.id) ? prev : [...prev, product.id]);
  };

  const removeFavorite = (productId: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== productId));
  };

  const isFavorite = (productId: string) => favoriteIds.includes(productId);

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
