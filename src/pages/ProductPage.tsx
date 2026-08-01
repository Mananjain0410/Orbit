import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useRecentView } from '../contexts/RecentViewContext';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../components/SEO';

export function ProductPage() {
  const { id } = useParams();
  const { products, categories, isLoading } = useStore();
  const product = products.find(p => p.id === id);
  const category = categories.find(c => c.id === product?.categoryId);
  
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addRecentView } = useRecentView();

  const [currentImage, setCurrentImage] = useState(0);
  const [colorQuantities, setColorQuantities] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const productId = product?.id;
  useEffect(() => {
    if (product) addRecentView(product);
  }, [productId, addRecentView]);

  if (isLoading) {
    return (
      <div className="py-32 text-center flex flex-col items-center min-h-[70vh] justify-center">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center flex flex-col items-center min-h-[70vh] justify-center">
        <SEO title="Product Not Found - MNFR Wholesale" />
        <h2 className="font-serif text-3xl mb-4">Product Not Found</h2>
        <Button variant="outline" className="rounded-none border-foreground text-foreground px-8 text-[11px] uppercase tracking-[1px]" onClick={() => window.history.back()}>
          Return
        </Button>
      </div>
    );
  }

  const isFav = isFavorite(product.id);

  const toggleFavorite = () => {
    if (isFav) removeFavorite(product.id);
    else addFavorite(product);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `MNFR Wholesale - ${product.patternNumber}`,
        url: window.location.href,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const handleQuantityChange = (colorName: string, value: string) => {
    if (value === '') {
      setColorQuantities(prev => {
        const next = { ...prev };
        delete next[colorName];
        return next;
      });
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setColorQuantities(prev => ({ ...prev, [colorName]: num.toString() }));
    }
  };

  const totalSetsSelected: number = Object.values(colorQuantities).reduce<number>((acc, val) => acc + parseInt(val as string || '0', 10), 0);
  const estimatedPrice: number = totalSetsSelected * (product.price || 0) * (product.sizes?.length || 0);

  const handleAddToCart = () => {
    if (totalSetsSelected === 0) return;
    
    const selections = Object.entries(colorQuantities)
      .map(([name, qty]) => {
        const color = product.colors.find(c => c.name === name);
        return { name, hex: color?.hex || '', quantity: parseInt(qty as string, 10) };
      })
      .filter(sel => sel.quantity > 0);

    addToCart(product, selections);
    setColorQuantities({});
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 min-h-[70vh] pt-24 md:pt-32">
      <SEO 
        title={`${product.patternNumber} - MNFR Wholesale`} 
        description={product.description}
        type="product"
      />
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Gallery */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-[3/4] bg-muted w-full relative overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={product.images[currentImage]} 
                alt={product.patternNumber} 
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentImage((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`aspect-square bg-muted overflow-hidden border-2 transition-colors ${currentImage === idx ? 'border-foreground' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover mix-blend-multiply opacity-70 hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="flex justify-between items-start mb-6 border-b border-border pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-2">{category?.name} &bull; {product.fabric}</span>
              <h1 className="font-serif text-4xl md:text-5xl">{product.patternNumber}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFavorite} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors text-foreground">
                <Heart fill={isFav ? "currentColor" : "none"} className={isFav ? "text-red-500 w-4 h-4" : "w-4 h-4"} />
              </button>
              <button onClick={handleShare} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors text-foreground">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-end gap-3 mb-8">
            <span className="text-2xl font-medium tracking-tight">₹{product.price}</span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-[1px] pb-1">/ piece</span>
          </div>

          <div className="bg-muted/50 p-6 mb-8 border border-border">
            <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-accent mb-4">Size Configuration</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {product.sizes.map(size => (
                <div key={size} className="w-10 h-10 border border-foreground flex items-center justify-center text-sm font-medium">
                  {size}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Important:</strong> We only sell in complete sets. Every quantity you enter below represents one complete set containing <strong>all {product.sizes.length} sizes</strong> shown above.
            </p>
          </div>

          <div className="mb-8 border-b border-border pb-8">
            <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-accent mb-6">Select Quantities (Sets)</h3>
            <div className="space-y-4">
              {product.colors.map(color => {
                const stock = typeof color.stock === 'number' ? color.stock : undefined;
                const isOutOfStock = stock === 0;
                const isLowStock = typeof stock === 'number' && stock > 0 && stock <= 10;
                const requestedQty = parseInt(colorQuantities[color.name] || '0', 10);
                const exceedsStock = typeof stock === 'number' && stock > 0 && requestedQty > stock;

                return (
                  <div key={color.name} className="flex flex-col gap-2 p-3 border border-border hover:border-foreground/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border border-border shadow-sm shrink-0" style={{ backgroundColor: color.hex }} />
                        <span className="text-sm font-medium">{color.name}</span>
                        {isLowStock && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                            Only {stock} sets left
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {isOutOfStock || !product.inStock ? (
                          <span className="text-[10px] uppercase tracking-[1px] text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded font-bold">Out of Stock</span>
                        ) : (
                          <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={colorQuantities[color.name] || ''}
                            onChange={(e) => handleQuantityChange(color.name, e.target.value)}
                            className="w-20 h-10 border border-border text-center focus:outline-none focus:border-foreground text-sm font-medium bg-background"
                          />
                        )}
                      </div>
                    </div>
                    {exceedsStock && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 p-2 rounded flex items-center justify-between">
                        <span>You requested {requestedQty} sets. Only {stock} sets are currently available.</span>
                        <span className="text-[10px] uppercase tracking-[0.5px] font-bold text-amber-900">Order allowed</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 bg-background pt-4 pb-4 border-t border-border mt-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">Live Summary</span>
                <div className="text-sm">
                  <strong>{totalSetsSelected}</strong> sets ({totalSetsSelected * (product.sizes?.length || 0)} pcs)
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">Est. Total</span>
                <div className="text-xl font-medium tracking-tight">₹{estimatedPrice.toLocaleString()}</div>
              </div>
            </div>
            <Button 
              className="w-full rounded-none h-14 text-[11px] uppercase tracking-[2px] font-bold"
              disabled={totalSetsSelected === 0 || !product.inStock}
              onClick={handleAddToCart}
            >
              {added ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Added to Cart</span>
              ) : (
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Add to Cart</span>
              )}
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-accent mb-4">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
