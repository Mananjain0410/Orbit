import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ProductGrid } from '../components/product/ProductGrid';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { SlidersHorizontal, X, PackageX, Check } from 'lucide-react';
import { SEO } from '../components/SEO';
import { slugify } from '../lib/utils';

export function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { products: allProducts, categories, isLoading } = useStore();
  
  const targetSlug = (slug || '').toLowerCase().trim();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  // Filter selections
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('newest');

  // Find category matching slug, slugified name, or id
  const category = categories.find(c => 
    c.slug?.toLowerCase() === targetSlug || 
    slugify(c.name) === targetSlug ||
    c.id === targetSlug ||
    c.name.toLowerCase() === targetSlug
  ) || (targetSlug === 'all' || targetSlug === 'search' || searchQuery ? { id: 'all', name: searchQuery ? `Search Results` : 'All Products', slug: 'all' } : null);

  // 1. Base Published Products for this Category
  const baseProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (p.status && p.status !== 'Published') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          p.patternNumber?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.keywords?.some(k => k.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      
      if (category && category.id !== 'all') {
        const matchesCategory = 
          p.categoryId === category.id ||
          p.categoryId === category.slug ||
          (p.categoryName && p.categoryName.toLowerCase() === category.name.toLowerCase()) ||
          (category.slug && p.categoryId === category.slug);
        if (!matchesCategory) return false;
      }

      return true;
    });
  }, [allProducts, searchQuery, category]);

  // 2. Extract Dynamic Filter Options from Base Products
  const availableFabrics = useMemo(() => {
    return Array.from(new Set(baseProducts.map(p => p.fabric).filter(Boolean))) as string[];
  }, [baseProducts]);

  const availableFits = useMemo(() => {
    return Array.from(new Set(baseProducts.map(p => p.fit).filter(Boolean))) as string[];
  }, [baseProducts]);

  const availableLengths = useMemo(() => {
    return Array.from(new Set(baseProducts.map(p => p.length).filter(Boolean))) as string[];
  }, [baseProducts]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    baseProducts.forEach(p => {
      p.colors?.forEach(c => {
        if (c.name && !map.has(c.name)) {
          map.set(c.name, c.hex || '#000000');
        }
      });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [baseProducts]);

  // 3. Filter and Sort Products
  const finalProducts = useMemo(() => {
    let list = baseProducts.filter(p => {
      if (selectedFabrics.length > 0 && !selectedFabrics.includes(p.fabric)) return false;
      if (selectedFits.length > 0 && (!p.fit || !selectedFits.includes(p.fit))) return false;
      if (selectedLengths.length > 0 && (!p.length || !selectedLengths.includes(p.length))) return false;
      if (selectedColors.length > 0) {
        const hasColor = p.colors?.some(c => selectedColors.includes(c.name));
        if (!hasColor) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      switch (selectedSort) {
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'pattern':
          return (a.patternNumber || '').localeCompare(b.patternNumber || '');
        case 'alpha':
          return (`${a.patternNumber} ${a.fabric}`).localeCompare(`${b.patternNumber} ${b.fabric}`);
        case 'newest':
        default:
          return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });
  }, [baseProducts, selectedFabrics, selectedColors, selectedFits, selectedLengths, selectedSort]);

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics(prev => prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]);
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]);
  };

  const toggleFit = (fit: string) => {
    setSelectedFits(prev => prev.includes(fit) ? prev.filter(f => f !== fit) : [...prev, fit]);
  };

  const toggleLength = (len: string) => {
    setSelectedLengths(prev => prev.includes(len) ? prev.filter(l => l !== len) : [...prev, len]);
  };

  const clearAllFilters = () => {
    setSelectedFabrics([]);
    setSelectedColors([]);
    setSelectedFits([]);
    setSelectedLengths([]);
    setSelectedSort('newest');
  };

  if (isLoading) {
    return (
      <div className="py-32 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <Spinner />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-32 text-center flex flex-col items-center min-h-[70vh] justify-center">
        <SEO title="Category Not Found - MNFR Wholesale" />
        <h2 className="font-serif text-3xl mb-4">Category Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
          We couldn't find the requested category. It may have been renamed or removed.
        </p>
        <Button variant="outline" className="rounded-none border-foreground text-foreground px-8 text-[11px] uppercase tracking-[1px]" onClick={() => window.history.back()}>
          Return
        </Button>
      </div>
    );
  }

  const FilterSidebarContent = () => (
    <div className="space-y-8">
      {/* Sort By */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-foreground/70 mb-3">Sort Catalog By</h3>
        <select 
          value={selectedSort} 
          onChange={e => setSelectedSort(e.target.value)}
          className="w-full h-9 px-2 text-xs border border-border rounded bg-background focus:ring-1 focus:ring-foreground"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="pattern">Pattern Number</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      {/* Fabric Dynamic Filter */}
      {availableFabrics.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-foreground/70 mb-3">Fabric</h3>
          <ul className="space-y-2">
            {availableFabrics.map((fabric) => (
              <li key={fabric} className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id={`fab-${fabric}`} 
                  checked={selectedFabrics.includes(fabric)}
                  onChange={() => toggleFabric(fabric)}
                  className="rounded border-border text-foreground focus:ring-foreground h-4 w-4" 
                />
                <label htmlFor={`fab-${fabric}`} className="text-xs font-medium cursor-pointer text-foreground/80 hover:text-foreground">
                  {fabric}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Colors Dynamic Filter */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-foreground/70 mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const isSelected = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => toggleColor(color.name)}
                  className={`w-7 h-7 rounded-full border border-border flex items-center justify-center relative transition-transform ${isSelected ? 'ring-2 ring-foreground scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {isSelected && <Check className={`w-3.5 h-3.5 ${color.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'}`} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fit Dynamic Filter */}
      {availableFits.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-foreground/70 mb-3">Fit</h3>
          <ul className="space-y-2">
            {availableFits.map((fit) => (
              <li key={fit} className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id={`fit-${fit}`} 
                  checked={selectedFits.includes(fit)}
                  onChange={() => toggleFit(fit)}
                  className="rounded border-border text-foreground focus:ring-foreground h-4 w-4" 
                />
                <label htmlFor={`fit-${fit}`} className="text-xs font-medium cursor-pointer text-foreground/80 hover:text-foreground">
                  {fit}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Length Dynamic Filter */}
      {availableLengths.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-foreground/70 mb-3">Length</h3>
          <ul className="space-y-2">
            {availableLengths.map((len) => (
              <li key={len} className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id={`len-${len}`} 
                  checked={selectedLengths.includes(len)}
                  onChange={() => toggleLength(len)}
                  className="rounded border-border text-foreground focus:ring-foreground h-4 w-4" 
                />
                <label htmlFor={`len-${len}`} className="text-xs font-medium cursor-pointer text-foreground/80 hover:text-foreground">
                  {len}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(selectedFabrics.length > 0 || selectedColors.length > 0 || selectedFits.length > 0 || selectedLengths.length > 0) && (
        <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full text-[10px] uppercase tracking-[1px]">
          Clear Active Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 min-h-[70vh] pt-24 md:pt-32">
      <SEO 
        title={`${category.name} Wholesale - MNFR`} 
        description={`Browse our premium collection of wholesale ${category.name.toLowerCase()} for retailers.`} 
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif italic tracking-tight capitalize">{category.name}</h1>
          <p className="text-[11px] text-muted-foreground mt-3 uppercase tracking-[1px]">
            Showing {finalProducts.length} of {baseProducts.length} items
          </p>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <Button 
            variant="outline" 
            className="rounded-none h-10 text-[11px] uppercase tracking-[1px] px-6"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters & Sort
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebarContent />
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[60] bg-background md:hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-xl">Filters & Sorting</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FilterSidebarContent />
            </div>
            <div className="p-4 border-t border-border flex gap-4 bg-background">
              <Button variant="outline" className="flex-1 rounded-none text-[11px] uppercase tracking-[1px]" onClick={clearAllFilters}>
                Clear
              </Button>
              <Button className="flex-1 rounded-none bg-foreground text-background text-[11px] uppercase tracking-[1px]" onClick={() => setMobileFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="flex-1 min-h-[400px]">
          {finalProducts.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/10 h-full min-h-[300px]">
              <PackageX className="w-12 h-12 text-muted-foreground/50 mb-4 stroke-1" />
              <h2 className="font-serif text-2xl mb-2 text-foreground">No Products Match Selection</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                Try clearing active filters to see available catalog items.
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="uppercase text-[10px] tracking-[1px]">
                Reset Filters
              </Button>
            </div>
          ) : (
            <ProductGrid products={finalProducts} />
          )}
        </main>
      </div>
    </div>
  );
}
