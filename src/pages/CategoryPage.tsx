import React, { useState } from 'react';
import { useParams } from 'react-router';
import { ProductGrid } from '../components/product/ProductGrid';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/Button';
import { SlidersHorizontal, X } from 'lucide-react';
import { SEO } from '../components/SEO';

export function CategoryPage() {
  const { slug } = useParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { products: allProducts, categories } = useStore();
  
  const category = categories.find(c => c.slug === slug);
  const products = allProducts.filter(p => p.categoryId === category?.id);

  if (!category) {
    return (
      <div className="py-32 text-center flex flex-col items-center">
        <SEO title="Category Not Found - MNFR Wholesale" />
        <h2 className="font-serif text-3xl mb-4">No Products Available</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
          We couldn't find any products in this category. They might be out of stock or discontinued.
        </p>
        <Button variant="outline" className="rounded-none border-foreground text-foreground px-8 text-[11px] uppercase tracking-[1px]" onClick={() => window.history.back()}>
          Return
        </Button>
      </div>
    );
  }

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-accent mb-4">Fabric</h3>
        <ul className="space-y-3">
          {['Premium Cotton', 'Dry Fit', 'Denim', 'Cotton Twill'].map((fabric) => (
            <li key={fabric} className="flex items-center gap-3">
              <input type="checkbox" id={fabric} className="rounded-sm border-border" />
              <label htmlFor={fabric} className="text-[13px] font-medium cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                {fabric}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-accent mb-4">Color</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Black", hex: "#000000" },
            { name: "Navy", hex: "#000080" },
            { name: "Grey", hex: "#808080" },
            { name: "Olive", hex: "#808000" },
            { name: "Beige", hex: "#F5F5DC" },
            { name: "White", hex: "#FFFFFF" }
          ].map((color) => (
            <button
              key={color.name}
              className="w-6 h-6 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-accent mb-4">Sort By</h3>
        <ul className="space-y-3">
          {['Newest', 'Price: Low to High', 'Price: High to Low', 'Best Selling'].map((sort) => (
            <li key={sort} className="flex items-center gap-3">
              <input type="radio" name="sort" id={sort} className="border-border text-foreground focus:ring-foreground" />
              <label htmlFor={sort} className="text-[13px] font-medium cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                {sort}
              </label>
            </li>
          ))}
        </ul>
      </div>
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
            Premium wholesale {category.name.toLowerCase()} &mdash; Showing {products.length} items
          </p>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <Button 
            variant="outline" 
            className="rounded-none h-10 text-[11px] uppercase tracking-[1px] px-6"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar />
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
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-border flex gap-4 bg-background">
              <Button variant="outline" className="flex-1 rounded-none text-[11px] uppercase tracking-[1px]" onClick={() => setMobileFiltersOpen(false)}>
                Clear
              </Button>
              <Button className="flex-1 rounded-none bg-foreground text-background text-[11px] uppercase tracking-[1px]" onClick={() => setMobileFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="flex-1">
          {products.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <h2 className="font-serif text-2xl mb-4">No Products Found</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </main>
      </div>
    </div>
  );
}
