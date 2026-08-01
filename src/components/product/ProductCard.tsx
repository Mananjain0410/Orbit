import React, { useState } from 'react';
import { Product } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const isFav = isFavorite(product.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFav) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group outline-none flex flex-col gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted relative rounded-sm flex items-center justify-center">
        <img
          src={product.images[currentImage]}
          alt={product.description}
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Navigation Arrows for Multiple Images */}
        {product.images.length > 1 && isHovered && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {product.images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImage ? 'w-4 bg-foreground' : 'w-1.5 bg-foreground/30'}`}
              />
            ))}
          </div>
        )}

        {/* Badges and Actions */}
        <div className="absolute top-2 left-2 z-10">
          <button 
            onClick={toggleFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isFav ? 'bg-background text-red-500' : 'bg-background/80 text-foreground hover:bg-background'}`}
          >
            <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          {!product.inStock && (
            <div className="bg-foreground text-background text-[9px] uppercase tracking-wider px-2 py-1 rounded-sm">
              Out of stock
            </div>
          )}
          {product.id === 'p1' || product.id === 'p3' ? (
            <div className="bg-accent text-accent-foreground text-[9px] uppercase tracking-wider px-2 py-1 rounded-sm font-bold shadow-sm">
              Best Seller
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[2px]">SKU: {product.patternNumber}</span>
        <span className="text-[13px] font-medium leading-tight line-clamp-1">{product.fabric} - {product.categoryId === 'c1' ? 'Lower' : product.categoryId === 'c2' ? 'Capri' : product.categoryId === 'c3' ? 'Bermuda' : 'Boxer'}</span>
        
        <div className="flex gap-1.5 mt-1.5 mb-1">
          {product.colors.map(color => (
            <div 
              key={color.name}
              className="w-3 h-3 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>

        <div className="flex justify-between items-center mt-1 pt-2 border-t border-border">
          <span className="text-[13px] font-semibold">₹{product.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
