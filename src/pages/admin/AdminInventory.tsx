import { Skeleton } from '../../components/ui/Skeleton';
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useAdminData } from '../../contexts/AdminDataContext';
import { Search, Filter, Edit2, Check } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types';

export function AdminInventory() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  
  const { products, categories, updateProduct } = useAdminData();
  const isLoading = products.length === 0;
  
  const [editingStock, setEditingStock] = useState<{ productId: string, colorName: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const lowStockThreshold = 50; // Configure later from settings

  const inventoryItems = useMemo(() => {
    let items: any[] = [];
    products.forEach(p => {
      p.colors.forEach(c => {
        items.push({
          productId: p.id,
          patternNumber: p.patternNumber,
          categoryId: p.categoryId,
          fabric: p.fabric,
          colorName: c.name,
          hex: c.hex,
          stock: c.stock || 0,
          sizes: (p.availableSizes && p.availableSizes.length > 0) 
            ? p.availableSizes 
            : (p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL']),
          updatedAt: p.updatedAt,
          productImage: p.images[0]
        });
      });
    });
    
    return items.filter(item => {
      const matchesSearch = item.patternNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.colorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'all' || item.categoryId === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'out') matchesStatus = item.stock === 0;
      else if (statusFilter === 'low') matchesStatus = item.stock > 0 && item.stock <= lowStockThreshold;
      else if (statusFilter === 'in') matchesStatus = item.stock > lowStockThreshold;
      
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter, lowStockThreshold]);

  const handleStockEdit = (productId: string, colorName: string, currentStock: number) => {
    setEditingStock({ productId, colorName });
    setEditValue(currentStock.toString());
  };

  const saveStock = (productId: string, colorName: string) => {
    const newStock = parseInt(editValue, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      const p = products.find(prod => prod.id === productId);
      if (p) {
        updateProduct(productId, {
          colors: p.colors.map(c => c.name === colorName ? { ...c, stock: newStock } : c)
        });
      }
    }
    setEditingStock(null);
  };

  const getStatusBadge = (stock: number) => {
    if (stock === 0) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Out of Stock</span>;
    if (stock <= lowStockThreshold) return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Low Stock</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">In Stock</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Manage stock levels for all product variants.</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search pattern, fabric, color..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground text-xs uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category / Fabric</th>
                <th className="px-6 py-4 font-medium">Color</th>
                <th className="px-6 py-4 font-medium">Sizes</th>
                <th className="px-6 py-4 font-medium">Stock Status</th>
                <th className="px-6 py-4 font-medium">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full max-w-[150px]" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full max-w-[100px]" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full max-w-[80px]" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full max-w-[80px]" /></td>
                  </tr>
                ))
              ) : inventoryItems.map((item, idx) => {
                const cat = categories.find(c => c.id === item.categoryId);
                const isEditing = editingStock?.productId === item.productId && editingStock?.colorName === item.colorName;
                return (
                  <tr key={`${item.productId}-${item.colorName}-${idx}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {item.productImage && <img src={item.productImage} alt={item.patternNumber} className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-foreground">{item.patternNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="font-medium text-foreground">{cat?.name}</div>
                      <div className="text-xs">{item.fabric}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: item.hex }} />
                        <span>{item.colorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.sizes.join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.stock)}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-20 h-8 text-sm" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveStock(item.productId, item.colorName)}
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => saveStock(item.productId, item.colorName)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-between group cursor-pointer p-2 -ml-2 rounded-md hover:bg-muted/50 transition-colors"
                          onClick={() => handleStockEdit(item.productId, item.colorName, item.stock)}
                        >
                          <span className="font-medium">{item.stock} <span className="text-xs text-muted-foreground font-normal">sets</span></span>
                          <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!isLoading && inventoryItems.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Inventory Found</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                We couldn't find any products matching your current filters. Try adjusting your search or clearing the status filter.
              </p>
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
