import React, { useState, useEffect } from 'react';
import { useRetailer } from '../../contexts/RetailerAuthContext';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { Order, Product } from '../../types';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../ui/Toast';
import { ShoppingBag, RefreshCw, Check, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface ReorderProduct {
  product: Product;
  lastOrderedColorQuantities: Record<string, number>;
  totalOrderedSets: number;
  orderCount: number;
  lastOrderedAt: number;
}

export function QuickReorder() {
  const { retailer } = useRetailer();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [reorderProducts, setReorderProducts] = useState<ReorderProduct[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, Record<string, number>>>({});
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!retailer) {
      setLoading(false);
      return;
    }

    const loadPastOrders = async () => {
      try {
        setLoading(true);
        const orders = await orderService.getRetailerOrders(retailer.uid);
        const allProducts = await productService.getAllProducts(true);

        const productStatsMap: Record<string, {
          product: Product;
          lastOrderedColorQuantities: Record<string, number>;
          totalOrderedSets: number;
          orderCount: number;
          lastOrderedAt: number;
        }> = {};

        // Loop from oldest to newest so last ordered color quantities overwrite with most recent order
        const sortedOrders = [...orders].sort((a, b) => a.createdAt - b.createdAt);

        for (const order of sortedOrders) {
          for (const item of order.items) {
            const matchedProduct = allProducts.find(p => p.id === item.productId || p.patternNumber === item.patternNumber);
            if (!matchedProduct) continue;

            const pId = matchedProduct.id;
            if (!productStatsMap[pId]) {
              productStatsMap[pId] = {
                product: matchedProduct,
                lastOrderedColorQuantities: {},
                totalOrderedSets: 0,
                orderCount: 0,
                lastOrderedAt: order.createdAt
              };
            }

            const stat = productStatsMap[pId];
            stat.orderCount += 1;
            stat.totalOrderedSets += (item.sets || 0);
            stat.lastOrderedAt = Math.max(stat.lastOrderedAt, order.createdAt);
            
            // Prefill quantities from recent order
            stat.lastOrderedColorQuantities[item.color] = item.sets || 0;
          }
        }

        const statsList = Object.values(productStatsMap).sort((a, b) => b.lastOrderedAt - a.lastOrderedAt);
        setReorderProducts(statsList);

        // Initialized selected quantities state
        const initialQtyState: Record<string, Record<string, number>> = {};
        for (const stat of statsList) {
          initialQtyState[stat.product.id] = { ...stat.lastOrderedColorQuantities };
        }
        setSelectedQuantities(initialQtyState);

      } catch (error) {
        console.error('Failed to load past orders for quick reorder:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPastOrders();
  }, [retailer]);

  const handleQuantityChange = (productId: string, colorName: string, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [colorName]: Math.max(0, quantity)
      }
    }));
  };

  const handleAddToCart = (item: ReorderProduct) => {
    const product = item.product;
    const colorQtys = selectedQuantities[product.id] || {};

    const selections = (product.colors || [])
      .map(c => ({
        name: c.name,
        hex: c.hex || '#000000',
        quantity: colorQtys[c.name] || 0
      }))
      .filter(s => s.quantity > 0);

    if (selections.length === 0) {
      showToast('Please specify a quantity greater than 0 for at least one color.', 'error');
      return;
    }

    addToCart(product, selections);
    showToast(`Added ${product.patternNumber} to cart!`, 'success');

    setAddedProductIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProductIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><Spinner /></div>;
  }

  if (reorderProducts.length === 0) {
    return null; // No previous orders yet
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm my-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl">Quick Order (Add Again)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reorder your frequently purchased patterns with auto-prefilled quantities.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-muted px-3 py-1 rounded-full uppercase tracking-wider text-muted-foreground">
          {reorderProducts.length} Past Products
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reorderProducts.slice(0, 4).map((item) => {
          const product = item.product;
          const currentQtys = selectedQuantities[product.id] || {};
          const isAdded = addedProductIds.has(product.id);
          const totalSelectedSets = (Object.values(currentQtys) as number[]).reduce((sum, q) => sum + (q || 0), 0);

          return (
            <div key={product.id} className="border border-border p-4 rounded-lg bg-background flex flex-col justify-between hover:border-accent/40 transition-colors">
              <div>
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-24 bg-muted rounded overflow-hidden shrink-0 border border-border">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.patternNumber} className="w-full h-full object-cover mix-blend-multiply" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-[1px] font-bold text-accent">{product.fabric}</span>
                      <span className="text-xs font-semibold">₹{product.price} / set</span>
                    </div>
                    <h3 className="font-serif text-xl">{product.patternNumber}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last ordered {new Date(item.lastOrderedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Color quantities input */}
                <div className="space-y-2 mb-4 bg-muted/20 p-3 rounded border border-border/50">
                  <span className="text-[10px] uppercase tracking-[1px] font-bold text-muted-foreground block mb-2">Configure Color Quantities (Sets)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {product.colors?.map(c => {
                      const qty = currentQtys[c.name] ?? 0;
                      const stock = typeof c.stock === 'number' ? c.stock : undefined;
                      const isOutOfStock = stock === 0;
                      const isLowStock = typeof stock === 'number' && stock > 0 && stock <= 10;

                      return (
                        <div key={c.name} className="flex items-center justify-between bg-background p-2 rounded border border-border">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: c.hex }} />
                            <span className="text-xs font-medium truncate max-w-[70px]">{c.name}</span>
                            {isLowStock && (
                              <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                Only {stock} left
                              </span>
                            )}
                          </div>
                          {isOutOfStock ? (
                            <span className="text-[9px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              Out of Stock
                            </span>
                          ) : (
                            <input 
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => handleQuantityChange(product.id, c.name, parseInt(e.target.value) || 0)}
                              className="w-14 h-7 border border-input rounded text-center text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                <span className="text-xs text-muted-foreground">
                  Total: <strong className="text-foreground">{totalSelectedSets} sets</strong> (₹{(totalSelectedSets * product.price).toLocaleString()})
                </span>
                <Button 
                  size="sm" 
                  onClick={() => handleAddToCart(item)} 
                  disabled={totalSelectedSets === 0}
                  className="rounded-none text-[10px] uppercase tracking-[1px] font-bold h-9"
                >
                  {isAdded ? (
                    <><Check className="w-3.5 h-3.5 mr-1" /> Added</>
                  ) : (
                    <><ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add Again</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
