import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartColorSelection {
  name: string;
  hex: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  selections: CartColorSelection[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selections: CartColorSelection[]) => void;
  updateQuantity: (productId: string, colorName: string, quantity: number) => void;
  removeColor: (productId: string, colorName: string) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
  loadSavedCart: (cartItems: CartItem[]) => void;
  totalSets: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('b2b_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('b2b_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, selections: CartColorSelection[]) => {
    if (selections.length === 0) return;
    
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newSelections = [...existing.selections];
        selections.forEach(sel => {
          const existingColor = newSelections.find(c => c.name === sel.name);
          if (existingColor) {
            existingColor.quantity += sel.quantity;
          } else {
            newSelections.push(sel);
          }
        });
        return prev.map(item => item.product.id === product.id ? { ...item, selections: newSelections } : item);
      }
      return [...prev, { product, selections }];
    });
  };

  const updateQuantity = (productId: string, colorName: string, quantity: number) => {
    if (quantity < 0) {
      removeColor(productId, colorName);
      return;
    }
    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          selections: item.selections.map(sel => sel.name === colorName ? { ...sel, quantity } : sel)
        };
      }
      return item;
    }));
  };

  const removeColor = (productId: string, colorName: string) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            selections: item.selections.filter(sel => sel.name !== colorName)
          };
        }
        return item;
      }).filter(item => item.selections.length > 0);
    });
  };

  const removeProduct = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const loadSavedCart = (cartItems: CartItem[]) => {
    setItems(cartItems);
  };

  const totalSets = items.reduce((acc, item) => acc + item.selections.reduce((sum, sel) => sum + sel.quantity, 0), 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.selections.reduce((sum, sel) => sum + sel.quantity, 0) * item.product.price), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeColor, removeProduct, clearCart, loadSavedCart, totalSets, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
