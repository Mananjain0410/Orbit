import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { dummyProducts, dummyCategories } from '../lib/dummyData';
import { SEO } from '../components/SEO';

export function Cart() {
  const { items, updateQuantity, removeColor, removeProduct, totalSets, totalPrice } = useCart();

  // Recommendations: Just random items not in cart for now
  const recommendations = dummyProducts.filter(p => !items.find(i => i.product.id === p.id)).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-[70vh] pt-24 md:pt-32">
      <SEO title="Your Wholesale Cart - MNFR" />
      <div className="flex items-end justify-between mb-10 border-b border-border pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-2">Wholesale</span>
          <h1 className="font-serif text-4xl md:text-5xl">Your Cart</h1>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-2xl font-medium">{totalSets}</span>
          <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground ml-2">Total Sets</span>
        </div>
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => {
              const category = dummyCategories.find(c => c.id === item.product.categoryId);
              return (
                <div key={item.product.id} className="border border-border p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                  {/* Product Info */}
                  <Link to={`/product/${item.product.id}`} className="sm:w-1/3 flex flex-col gap-3 group">
                    <div className="aspect-[3/4] bg-muted w-full overflow-hidden">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.patternNumber} 
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">{category?.name} &bull; {item.product.fabric}</span>
                      <h3 className="font-serif text-2xl">{item.product.patternNumber}</h3>
                      <div className="text-sm font-medium mt-1">₹{item.product.price} / pc</div>
                    </div>
                  </Link>
                  
                  {/* Color Selections */}
                  <div className="sm:w-2/3 flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                      <span className="text-[10px] uppercase tracking-[2px] font-bold text-accent">Selected Colors</span>
                      <Button variant="ghost" size="sm" onClick={() => removeProduct(item.product.id)} className="text-[10px] uppercase tracking-[1px] text-muted-foreground hover:text-red-500 h-8 px-2">
                        Remove Product
                      </Button>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      {item.selections.map(sel => (
                        <div key={sel.name} className="flex items-center justify-between p-3 border border-border">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: sel.hex }} />
                              <span className="text-sm font-medium">{sel.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-[1px]">Includes: {item.product.sizes.join(', ')}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={sel.quantity || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') updateQuantity(item.product.id, sel.name, 0);
                                else {
                                  const num = parseInt(val, 10);
                                  if (!isNaN(num) && num >= 0) updateQuantity(item.product.id, sel.name, num);
                                }
                              }}
                              className="w-16 h-8 border border-border text-center focus:outline-none focus:border-foreground text-sm font-medium bg-background"
                            />
                            <button onClick={() => removeColor(item.product.id, sel.name)} className="text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-end text-sm">
                      <span className="text-muted-foreground">Sets for this product:</span>
                      <span className="font-bold">{item.selections.reduce((acc, sel) => acc + sel.quantity, 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="border border-border p-6 bg-muted/20">
              <h2 className="text-[10px] uppercase tracking-[3px] font-bold mb-6 border-b border-border pb-4">Order Request Summary</h2>
              
              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Products</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Colors</span>
                  <span className="font-medium">{items.reduce((acc, item) => acc + item.selections.length, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sets</span>
                  <span className="font-medium">{totalSets}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 pb-6 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] uppercase tracking-[2px] font-bold">Estimated Value</span>
                  <span className="font-serif text-3xl">₹{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  This is an enquiry/order request. Final billing, GST, and shipping will be confirmed by the manufacturer.
                </p>
              </div>
              
              <Button 
                asChild
                className="w-full rounded-none h-14 text-[11px] uppercase tracking-[2px] font-bold"
              >
                <Link to="/checkout">Review Order Request <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center border border-border p-10 bg-muted/10">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6 stroke-1" />
          <h2 className="font-serif text-3xl mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-sm">
            You haven't added any wholesale products to your cart yet. Browse our catalog to find the latest collections.
          </p>
          <Button asChild className="rounded-none px-8 text-[11px] uppercase tracking-[2px] font-bold h-12">
            <Link to="/">Browse Catalog</Link>
          </Button>
        </div>
      )}

      {/* Recommendations */}
      {items.length > 0 && recommendations.length > 0 && (
        <div className="mt-24 border-t border-border pt-12">
          <h2 className="text-[10px] uppercase tracking-[3px] font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendations.map(product => {
              const category = dummyCategories.find(c => c.id === product.categoryId);
              return (
                <Link key={product.id} to={`/product/${product.id}`} className="group outline-none flex flex-col gap-3">
                  <div className="aspect-[3/4] overflow-hidden bg-muted relative border border-border">
                    <img src={product.images[0]} alt="" className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[2px]">{product.patternNumber}</span>
                    <span className="text-[12px] font-medium">{category?.name}</span>
                    <span className="text-[12px] font-semibold mt-1">₹{product.price}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
