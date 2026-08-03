import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../contexts/CartContext';
import { useRetailer } from '../../contexts/RetailerAuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { useStore } from '../../contexts/StoreContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { getCategoryUrl } from '../../lib/utils';

export function Header() {
  const { settings } = useSettings();
  const { businessProfile } = useMasterData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalSets } = useCart();
  const { retailer } = useRetailer();
  const { products, categories } = useStore();

  const activeLogo = businessProfile?.logoUrl || settings.storeInfo?.logoUrl;
  const activeBrandName = businessProfile?.brandName || businessProfile?.businessName || settings.storeInfo?.name || 'MNFR Wholesale';

  const isHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const searchResults = searchQuery.trim() === '' ? [] : products.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.patternNumber.toLowerCase().includes(query) ||
      product.fabric.toLowerCase().includes(query) ||
      product.keywords.some(k => k.toLowerCase().includes(query))
    );
  }).slice(0, 5);

  return (
    <>
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled || !isHome 
            ? 'bg-background border-b border-border shadow-sm py-2' 
            : 'bg-transparent py-4 text-foreground'
        }`}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4 md:w-1/3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              {activeLogo ? (
                <img src={activeLogo} alt={activeBrandName} className="h-8 md:h-10 max-w-[180px] object-contain" />
              ) : (
                <>
                  <span className="font-serif font-bold text-2xl tracking-tighter uppercase hidden sm:inline-block">
                    {activeBrandName}
                  </span>
                  <span className="font-serif font-bold text-2xl tracking-tighter uppercase sm:hidden">
                    {activeBrandName ? activeBrandName.substring(0, 4) : 'MNFR'}
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-8 text-[12px] font-medium uppercase tracking-[1px]">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={getCategoryUrl(cat)} 
                className="transition-opacity opacity-60 hover:opacity-100 text-current border-b border-transparent hover:border-current pb-0.5"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center justify-end space-x-4 flex-1 md:w-1/3 text-current">
            <div className="hidden sm:block w-full max-w-xs relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 opacity-70" />
                <Input
                  type="search"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-muted/50 pl-9 rounded-sm border-none focus-visible:ring-1 text-xs text-foreground"
                />
              </form>
              
              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-full max-w-md right-0 bg-background border border-border shadow-lg rounded-sm overflow-hidden"
                  >
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col">
                        <div className="px-4 py-2 bg-muted/50 border-b border-border text-[10px] uppercase tracking-[1px] text-muted-foreground">
                          Products ({searchResults.length})
                        </div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                          >
                            <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm" />
                            <div className="flex flex-col flex-1">
                              <span className="text-xs font-medium text-foreground">{product.patternNumber}</span>
                              <span className="text-[10px] text-muted-foreground">{product.fabric}</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground">₹{product.price}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No products found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button variant="ghost" size="icon" className="sm:hidden text-current">
              <Search className="h-5 w-5" />
            </Button>
            <NotificationBell userId={retailer?.uid} />
            <Button variant="ghost" size="icon" asChild className="text-current relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalSets > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-foreground text-background text-[9px] rounded-full flex items-center justify-center font-bold">
                    {totalSets > 99 ? '99+' : totalSets}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-current">
              <Link to="/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </div>
          
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[60] w-4/5 max-w-sm bg-background p-6 shadow-xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <span className="font-serif font-bold text-2xl tracking-tighter uppercase">
                  MNFR.
                </span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Search */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 pl-10 rounded-sm border-none focus-visible:ring-1"
                />
                
                {searchQuery.trim() !== '' && (
                  <div className="mt-2 bg-background border border-border rounded-sm shadow-lg overflow-hidden flex flex-col max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                        >
                          <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm" />
                          <div className="flex flex-col flex-1">
                            <span className="text-xs font-medium text-foreground">{product.patternNumber}</span>
                            <span className="text-[10px] text-muted-foreground">{product.fabric}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <nav className="flex flex-col space-y-6 flex-1">
                <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground">Catalog</span>
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={getCategoryUrl(cat)} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-serif italic tracking-wide"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-border pt-8 mt-auto flex flex-col gap-4">
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-[12px] uppercase tracking-[1px] font-medium flex items-center gap-3">
                  <User className="w-4 h-4" /> My Account
                </Link>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="text-[12px] uppercase tracking-[1px] font-medium flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4" /> Wholesale Cart {totalSets > 0 && `(${totalSets})`}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
