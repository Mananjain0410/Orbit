import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { User, LogOut, Heart, Clock, ShoppingBag, Edit, MapPin, Building, ShieldCheck, ChevronRight, Bookmark, Trash2, FolderPlus, Play, Check } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useRecentView } from '../contexts/RecentViewContext';
import { useCart } from '../contexts/CartContext';
import { useRetailer } from '../contexts/RetailerAuthContext';
import { orderService } from '../services/orderService';
import { savedCartService, SavedCart } from '../services/savedCartService';
import { useToast } from '../components/ui/Toast';
import { Order } from '../types';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ProductCard } from '../components/product/ProductCard';
import { SEO } from '../components/SEO';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/StatusBadge';

export function Profile() {
  const { favorites } = useFavorites();
  const { recentViews } = useRecentView();
  const { items, totalSets, totalPrice } = useCart();
  const { retailer, logout } = useRetailer();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'profile' | 'favorites' | 'recent' | 'cart' | 'history' | 'orders' | null;
  const initialTab = (tabParam === 'orders' ? 'history' : tabParam) || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'recent' | 'cart' | 'history'>(initialTab);
  
  useEffect(() => {
    const currentTabParam = searchParams.get('tab');
    const targetTab = currentTabParam === 'orders' ? 'history' : currentTabParam;
    if (targetTab && ['profile', 'favorites', 'recent', 'cart', 'history'].includes(targetTab)) {
      setActiveTab(targetTab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'profile' | 'favorites' | 'recent' | 'cart' | 'history') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const { loadSavedCart } = useCart();
  const { showToast } = useToast();
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(false);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);
  const [editCartName, setEditCartName] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    if (activeTab === 'history' && retailer) {
      setLoadingOrders(true);
      unsubscribe = orderService.subscribeToRetailerOrders(retailer.uid, (data) => {
        setOrders(data);
        setLoadingOrders(false);
      });
    }
    return () => unsubscribe();
  }, [activeTab, retailer]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (activeTab === 'cart' && retailer) {
      setLoadingCarts(true);
      unsubscribe = savedCartService.subscribeToSavedCarts(retailer.uid, (data) => {
        setSavedCarts(data);
        setLoadingCarts(false);
      });
    }
    return () => unsubscribe();
  }, [activeTab, retailer]);

  const handleLoadSavedCart = (savedCart: SavedCart) => {
    loadSavedCart(savedCart.items);
    showToast(`Loaded "${savedCart.name}" into your active cart`, 'success');
    navigate('/cart');
  };

  const handleDeleteSavedCart = async (cartId: string) => {
    try {
      await savedCartService.deleteSavedCart(cartId);
      showToast('Saved cart deleted', 'info');
    } catch (e) {
      showToast('Failed to delete saved cart', 'error');
    }
  };

  const handleRenameSavedCart = async (cartId: string) => {
    if (!editCartName.trim()) return;
    try {
      await savedCartService.renameSavedCart(cartId, editCartName.trim());
      showToast('Cart renamed', 'success');
      setEditingCartId(null);
    } catch (e) {
      showToast('Failed to rename cart', 'error');
    }
  };

  if (!retailer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-[70vh] flex flex-col justify-center items-center pt-32">
        <h2 className="text-3xl font-serif mb-4">Please log in to view your profile</h2>
        <Button onClick={() => navigate('/login')} className="rounded-none">Login</Button>
      </div>
    );
  }

  const profile = retailer;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-[70vh] pt-24 md:pt-32">
      <SEO title="Retailer Profile" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
        {/* Sidebar */}
        <div className="md:col-span-3 sticky top-32 self-start">
          <div className="mb-8">
            <h1 className="font-serif text-2xl mb-1">{profile.firmName}</h1>
            <p className="text-muted-foreground text-sm">{profile.ownerName}</p>
          </div>
          
          <nav className="flex flex-col space-y-1">
            <Button 
              variant={activeTab === 'profile' ? 'default' : 'ghost'} 
              className={`justify-start rounded-none h-12 text-[11px] uppercase tracking-[2px] font-bold ${activeTab === 'profile' ? '' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => handleTabChange('profile')}
            >
              <User className="mr-3 w-4 h-4" /> Account Details
            </Button>
            <Button 
              variant={activeTab === 'history' ? 'default' : 'ghost'} 
              className={`justify-start rounded-none h-12 text-[11px] uppercase tracking-[2px] font-bold ${activeTab === 'history' ? '' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => handleTabChange('history')}
            >
              <ShieldCheck className="mr-3 w-4 h-4" /> Order History
            </Button>
            <Button 
              variant={activeTab === 'favorites' ? 'default' : 'ghost'} 
              className={`justify-start rounded-none h-12 text-[11px] uppercase tracking-[2px] font-bold ${activeTab === 'favorites' ? '' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => handleTabChange('favorites')}
            >
              <Heart className="mr-3 w-4 h-4" /> Favorites ({favorites.length})
            </Button>
            <Button 
              variant={activeTab === 'recent' ? 'default' : 'ghost'} 
              className={`justify-start rounded-none h-12 text-[11px] uppercase tracking-[2px] font-bold ${activeTab === 'recent' ? '' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => handleTabChange('recent')}
            >
              <Clock className="mr-3 w-4 h-4" /> Recently Viewed
            </Button>
            <Button 
              variant={activeTab === 'cart' ? 'default' : 'ghost'} 
              className={`justify-start rounded-none h-12 text-[11px] uppercase tracking-[2px] font-bold ${activeTab === 'cart' ? '' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => handleTabChange('cart')}
            >
              <ShoppingBag className="mr-3 w-4 h-4" /> Saved Cart ({items.length})
            </Button>
            
            <div className="border-t border-border mt-4 pt-4">
              <Button 
                variant="ghost" 
                onClick={logout}
                className="justify-start rounded-none h-12 text-[11px] uppercase tracking-[2px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="mr-3 w-4 h-4" /> Logout
              </Button>
            </div>
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 min-h-[500px]">
          
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <h2 className="font-serif text-3xl">Retailer Profile</h2>
                <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-[1px]">
                  <Edit className="w-3 h-3 mr-2" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="border border-border p-6">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <User className="w-5 h-5" />
                    <h3 className="text-[11px] uppercase tracking-[2px] font-bold">Personal</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">Owner Name</span>
                      <p className="font-medium text-lg">{profile.ownerName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">Phone Number</span>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-border p-6">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <Building className="w-5 h-5" />
                    <h3 className="text-[11px] uppercase tracking-[2px] font-bold">Business Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">Firm Name</span>
                      <p className="font-medium text-lg">{profile.firmName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">GST Number</span>
                      <p className="font-mono bg-muted/50 px-2 py-1 inline-block mt-1">{profile.gst}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-border p-6 sm:col-span-2">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <MapPin className="w-5 h-5" />
                    <h3 className="text-[11px] uppercase tracking-[2px] font-bold">Location</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">City</span>
                      <p className="font-medium">{profile.city}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">State</span>
                      <p className="font-medium">{profile.state}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="font-serif text-3xl mb-8 border-b border-border pb-4">Order History</h2>
              
              {loadingOrders ? (
                <div className="py-20 flex justify-center"><Spinner /></div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Link key={order.id} to={`/order/${order.id}`} className="block border border-border p-6 hover:border-foreground transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="font-bold text-lg">{order.orderNumber}</span>
                            <StatusBadge status={order.status} type="order" />
                            {order.fulfillmentStatus && order.fulfillmentStatus !== 'Not Started' && (
                              <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.totalProducts} Products • {order.totalSets} Sets
                          </p>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground block mb-1">Estimated</span>
                            <span className="font-serif text-xl">₹{order.estimatedValue.toLocaleString()}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-border bg-muted/10 flex flex-col items-center">
                  <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 stroke-1" />
                  <h3 className="font-serif text-xl mb-2">No past orders found</h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    You haven't placed any wholesale order requests yet. Orders placed will appear here for your reference.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="font-serif text-3xl mb-8 border-b border-border pb-4">Saved Favorites</h2>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-border bg-muted/10">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 stroke-1" />
                  <p className="text-muted-foreground mb-6 text-sm">You haven't saved any products yet.</p>
                  <Button asChild className="rounded-none text-[11px] uppercase tracking-[2px] font-bold">
                    <Link to="/">Browse Catalog</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div>
              <h2 className="font-serif text-3xl mb-8 border-b border-border pb-4">Recently Viewed</h2>
              {recentViews.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentViews.map(product => (
                    <ProductCard key={`recent-${product.id}`} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-border bg-muted/10">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 stroke-1" />
                  <p className="text-muted-foreground mb-6 text-sm">You haven't viewed any products recently.</p>
                  <Button asChild className="rounded-none text-[11px] uppercase tracking-[2px] font-bold">
                    <Link to="/">Browse Catalog</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="space-y-8">
              {/* Active Cart Banner */}
              <div>
                <h2 className="font-serif text-3xl mb-6 border-b border-border pb-4">Current Active Cart</h2>
                {items.length > 0 ? (
                  <div className="border border-border p-6 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <ShoppingBag className="w-10 h-10 text-accent shrink-0" />
                      <div>
                        <h3 className="text-base font-bold">{items.length} Products ({totalSets} Sets)</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Estimated Value: ₹{totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button asChild className="rounded-none text-[11px] uppercase tracking-[2px] font-bold px-6 h-10">
                      <Link to="/cart">Open Active Cart</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-border bg-muted/10">
                    <p className="text-muted-foreground text-sm">Your active cart is currently empty.</p>
                  </div>
                )}
              </div>

              {/* Saved Carts Collection */}
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <h2 className="font-serif text-3xl">Saved Carts ({savedCarts.length})</h2>
                  <Button asChild variant="outline" className="rounded-none text-[10px] uppercase tracking-[1px]">
                    <Link to="/cart"><Bookmark className="w-3.5 h-3.5 mr-1.5" /> Save Current Cart</Link>
                  </Button>
                </div>

                {loadingCarts ? (
                  <div className="py-12 flex justify-center"><Spinner /></div>
                ) : savedCarts.length > 0 ? (
                  <div className="space-y-4">
                    {savedCarts.map(cart => {
                      const totalSetsInSavedCart = cart.items.reduce((acc, item) => acc + item.selections.reduce((sum, sel) => sum + sel.quantity, 0), 0);
                      const isEditing = editingCartId === cart.id;

                      return (
                        <div key={cart.id} className="border border-border p-6 bg-background rounded-lg shadow-sm hover:border-accent/40 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border">
                            <div>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text"
                                    value={editCartName}
                                    onChange={(e) => setEditCartName(e.target.value)}
                                    className="border border-input rounded px-3 py-1 text-sm font-semibold bg-background"
                                  />
                                  <Button size="sm" onClick={() => handleRenameSavedCart(cart.id)} className="h-8 text-xs">
                                    <Check className="w-3.5 h-3.5 mr-1" /> Save
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <Bookmark className="w-5 h-5 text-accent" />
                                  <h3 className="font-serif text-xl">{cart.name}</h3>
                                  <button 
                                    onClick={() => { setEditingCartId(cart.id); setEditCartName(cart.name); }}
                                    className="text-muted-foreground hover:text-foreground text-xs"
                                    title="Rename"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Saved on {new Date(cart.createdAt).toLocaleDateString()} • {cart.items.length} Products • {totalSetsInSavedCart} Sets
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button 
                                onClick={() => handleLoadSavedCart(cart)}
                                className="rounded-none text-[10px] uppercase tracking-[1px] font-bold h-10 px-5"
                              >
                                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Load Into Cart
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteSavedCart(cart.id)}
                                className="text-muted-foreground hover:text-red-500 h-10 w-10 p-0"
                                title="Delete saved cart"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {cart.items.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-muted/20 p-2 rounded border border-border/50 text-xs">
                                {item.product.images?.[0] && (
                                  <img src={item.product.images[0]} alt={item.product.patternNumber} className="w-8 h-10 object-cover rounded shrink-0 border border-border" />
                                )}
                                <div className="truncate">
                                  <span className="font-semibold block truncate">{item.product.patternNumber}</span>
                                  <span className="text-[10px] text-muted-foreground">{item.selections.reduce((s, sel) => s + sel.quantity, 0)} sets</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-border bg-muted/10 rounded-lg">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3 stroke-1" />
                    <h3 className="font-serif text-lg mb-1">No Saved Carts</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                      You haven't saved any cart configurations yet. Build a cart and click "Save Cart For Later" to reuse it anytime.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
