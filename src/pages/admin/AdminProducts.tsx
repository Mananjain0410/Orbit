import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { SEO } from '../../components/SEO';
import { useAdminData } from '../../contexts/AdminDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Search, Plus, Filter, MoreHorizontal, ChevronDown, CheckSquare, 
  Square, Download, Trash2, Edit2, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';
import { Product } from '../../types';

export function AdminProducts() {
  const { products, categories, bulkUpdateProducts, bulkDeleteProducts } = useAdminData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Product | 'category'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.patternNumber.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Filters
    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.categoryId === categoryFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField as keyof Product];
      let bVal: any = b[sortField as keyof Product];

      if (sortField === 'category') {
        aVal = categories.find(c => c.id === a.categoryId)?.name || '';
        bVal = categories.find(c => c.id === b.categoryId)?.name || '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, statusFilter, categoryFilter, sortField, sortDir, categories]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    
    if (action === 'publish') {
      bulkUpdateProducts(ids, { status: 'Published' });
    } else if (action === 'draft') {
      bulkUpdateProducts(ids, { status: 'Draft' });
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${ids.length} products?`)) {
        bulkDeleteProducts(ids);
      }
    }
    setSelectedIds(new Set());
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <SEO title="Products - Business Portal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your wholesale garment catalog.</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Search patterns, fabrics..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
            <span className="text-sm font-medium text-neutral-700 mr-2">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleBulkAction('publish')}>Publish</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleBulkAction('draft')}>Draft</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-neutral-900">
                    {selectedIds.size > 0 && selectedIds.size === filteredProducts.length ? (
                      <CheckSquare className="w-5 h-5 text-neutral-900" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Pattern No.</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Fabric</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Inventory</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-neutral-500">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-neutral-50 cursor-pointer transition-colors ${selectedIds.has(product.id) ? 'bg-neutral-50' : ''}`}
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => toggleSelect(product.id, e)} className="text-neutral-400 hover:text-neutral-900 mt-1">
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="w-5 h-5 text-neutral-900" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden border border-neutral-200">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.patternNumber} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">{product.patternNumber}</td>
                    <td className="px-4 py-3 text-neutral-600">{getCategoryName(product.categoryId)}</td>
                    <td className="px-4 py-3 text-neutral-600 truncate max-w-[150px]">{product.fabric}</td>
                    <td className="px-4 py-3 font-medium">₹{product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.status === 'Published' ? 'bg-green-50 text-green-700 border border-green-200' :
                        product.status === 'Hidden' ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {product.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.inStock ? (
                        <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/product/${product.id}`, '_blank');
                          }}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/products/${product.id}/edit`);
                          }}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
