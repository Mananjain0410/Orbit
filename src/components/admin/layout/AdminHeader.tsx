import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ExternalLink, Package, Tags, Users, ShoppingCart, X } from 'lucide-react';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { Link, useNavigate } from 'react-router';
import { NotificationBell } from '../../notifications/NotificationBell';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { retailerService } from '../../../services/retailerService';
import { orderService } from '../../../services/orderService';
import { Product, Category, Retailer, Order } from '../../../types';

export function AdminHeader({ setMobileOpen }: { setMobileOpen: (v: boolean) => void }) {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubP = productService.subscribeToAllProducts(true, setProducts);
    const unsubC = categoryService.subscribeToAllCategories(true, setCategories);
    const unsubR = retailerService.subscribeToAllRetailers(setRetailers);
    const unsubO = orderService.subscribeToAllOrders(setOrders);

    return () => {
      unsubP();
      unsubC();
      unsubR();
      unsubO();
    };
  }, []);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.toLowerCase().trim();

  const matchedProducts = cleanQuery
    ? products.filter(p => 
        p.patternNumber?.toLowerCase().includes(cleanQuery) ||
        p.fabric?.toLowerCase().includes(cleanQuery) ||
        p.categoryName?.toLowerCase().includes(cleanQuery) ||
        p.description?.toLowerCase().includes(cleanQuery)
      ).slice(0, 5)
    : [];

  const matchedCategories = cleanQuery
    ? categories.filter(c => 
        c.name.toLowerCase().includes(cleanQuery) ||
        c.slug?.toLowerCase().includes(cleanQuery)
      ).slice(0, 5)
    : [];

  const matchedRetailers = cleanQuery
    ? retailers.filter(r => 
        r.firmName?.toLowerCase().includes(cleanQuery) ||
        r.ownerName?.toLowerCase().includes(cleanQuery) ||
        r.phone?.toLowerCase().includes(cleanQuery) ||
        r.city?.toLowerCase().includes(cleanQuery) ||
        r.gst?.toLowerCase().includes(cleanQuery)
      ).slice(0, 5)
    : [];

  const matchedOrders = cleanQuery
    ? orders.filter(o => 
        o.orderNumber?.toLowerCase().includes(cleanQuery) ||
        o.firmName?.toLowerCase().includes(cleanQuery) ||
        o.ownerName?.toLowerCase().includes(cleanQuery) ||
        o.phone?.includes(cleanQuery) ||
        o.items?.some(i => i.patternNumber?.toLowerCase().includes(cleanQuery))
      ).slice(0, 5)
    : [];

  const hasResults = matchedProducts.length > 0 || matchedCategories.length > 0 || matchedRetailers.length > 0 || matchedOrders.length > 0;

  return (
    <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Global Search */}
        <div ref={searchRef} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 z-10" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products, retailers, categories..." 
            className="pl-9 pr-8 py-2 w-72 lg:w-96 bg-neutral-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200 transition-all outline-none"
          />
          {query ? (
            <button 
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="absolute right-3 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-3 hidden lg:flex items-center gap-1">
              <kbd className="font-sans text-[10px] font-medium text-neutral-400 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">⌘</kbd>
              <kbd className="font-sans text-[10px] font-medium text-neutral-400 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">K</kbd>
            </div>
          )}

          {/* Live Search Results Dropdown */}
          {isOpen && cleanQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto z-50">
              {hasResults ? (
                <div className="p-2 space-y-3">
                  {/* Products */}
                  {matchedProducts.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> Products
                      </div>
                      {matchedProducts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            navigate(`/admin/products/${p.id}/edit`);
                            setIsOpen(false);
                            setQuery('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-medium text-sm text-neutral-900 block">{p.fabric} ({p.patternNumber})</span>
                            <span className="text-xs text-neutral-500">{p.categoryName || 'Product'} • ₹{p.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {matchedCategories.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-t border-neutral-100 pt-2">
                        <Tags className="w-3 h-3" /> Categories
                      </div>
                      {matchedCategories.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            navigate(`/admin/categories`);
                            setIsOpen(false);
                            setQuery('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between transition-colors"
                        >
                          <span className="font-medium text-sm text-neutral-900">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Retailers */}
                  {matchedRetailers.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-t border-neutral-100 pt-2">
                        <Users className="w-3 h-3" /> Retailers
                      </div>
                      {matchedRetailers.map(r => (
                        <button
                          key={r.uid}
                          onClick={() => {
                            navigate(`/admin/retailers/${r.uid}`);
                            setIsOpen(false);
                            setQuery('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-medium text-sm text-neutral-900 block">{r.firmName} ({r.ownerName})</span>
                            <span className="text-xs text-neutral-500">{r.phone} • {r.city}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {matchedOrders.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-t border-neutral-100 pt-2">
                        <ShoppingCart className="w-3 h-3" /> Orders
                      </div>
                      {matchedOrders.map(o => (
                        <button
                          key={o.id}
                          onClick={() => {
                            navigate(`/admin/orders/${o.id}`);
                            setIsOpen(false);
                            setQuery('');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-medium text-sm text-neutral-900 block">{o.orderNumber} &mdash; {o.firmName}</span>
                            <span className="text-xs text-neutral-500">₹{o.totalAmount} • {o.status} ({o.fulfillmentStatus || 'Not Started'})</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-neutral-500">
                  No matching products, categories, retailers, or orders found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden lg:inline">View Store</span>
        </a>
        
        <div className="w-px h-6 bg-neutral-200 hidden sm:block mx-1"></div>

        <NotificationBell userId="Admin" />
        
        <Link to="/admin/profile" className="flex items-center gap-3 pl-2 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center border border-neutral-300">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-neutral-600">
                {user?.name.charAt(0) || 'A'}
              </span>
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-neutral-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-neutral-500 leading-tight">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
