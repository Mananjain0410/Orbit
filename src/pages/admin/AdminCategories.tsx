import React, { useState } from 'react';
import { Link } from 'react-router';
import { SEO } from '../../components/SEO';
import { useAdminData } from '../../contexts/AdminDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Plus, Search, Edit2, Trash2, Image as ImageIcon, Check, X, GripVertical
} from 'lucide-react';
import { Category } from '../../types';

export function AdminCategories() {
  const { categories, products, updateCategory, addCategory, deleteCategory } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Category>>({ name: '', description: '', status: 'Published' });

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const startEdit = (cat: Category) => {
    setIsEditing(cat.id);
    setEditForm(cat);
  };

  const saveEdit = () => {
    if (isEditing && editForm.name) {
      updateCategory(isEditing, editForm);
      setIsEditing(null);
    }
  };

  const saveAdd = () => {
    if (addForm.name) {
      addCategory(addForm as any);
      setIsAdding(false);
      setAddForm({ name: '', description: '', status: 'Published' });
    }
  };

  const handleDelete = (cat: Category) => {
    const count = getProductCount(cat.id);
    if (count > 0) {
      alert(`Cannot delete category "${cat.name}" because it contains ${count} products. Please reassign or delete the products first, or change the category status to Hidden.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      deleteCategory(cat.id);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...filteredCategories];
    const current = items[index];
    const prev = items[index - 1];
    
    // Swap display order
    const temp = current.displayOrder;
    updateCategory(current.id, { displayOrder: prev.displayOrder });
    updateCategory(prev.id, { displayOrder: temp });
  };

  const moveDown = (index: number) => {
    if (index === filteredCategories.length - 1) return;
    const items = [...filteredCategories];
    const current = items[index];
    const next = items[index + 1];
    
    // Swap display order
    const temp = current.displayOrder;
    updateCategory(current.id, { displayOrder: next.displayOrder });
    updateCategory(next.id, { displayOrder: temp });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SEO title="Categories - Business Portal" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">Organize your products into collections.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {isAdding && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-medium mb-4">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Category Name *</label>
              <Input 
                value={addForm.name} 
                onChange={e => setAddForm({ ...addForm, name: e.target.value })} 
                placeholder="e.g. Kurta Sets"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Status</label>
              <select 
                value={addForm.status}
                onChange={e => setAddForm({ ...addForm, status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-neutral-700">Description</label>
              <Input 
                value={addForm.description || ''} 
                onChange={e => setAddForm({ ...addForm, description: e.target.value })} 
                placeholder="Brief description for SEO..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            <Button variant="outline" onClick={() => setIsAdding(false)} className="bg-white">Cancel</Button>
            <Button onClick={saveAdd} disabled={!addForm.name} className="bg-neutral-900 text-white hover:bg-neutral-800">
              Save Category
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 w-16 text-center">Order</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-neutral-50 group">
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveUp(index)} disabled={index === 0} className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30">
                          ▲
                        </button>
                        <button onClick={() => moveDown(index)} disabled={index === filteredCategories.length - 1} className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30">
                          ▼
                        </button>
                      </div>
                    </td>
                    
                    {isEditing === cat.id ? (
                      <td colSpan={5} className="px-4 py-4">
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input 
                              value={editForm.name} 
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                              placeholder="Name"
                            />
                            <Input 
                              value={editForm.description || ''} 
                              onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
                              placeholder="Description"
                            />
                            <select 
                              value={editForm.status}
                              onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                              className="h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                            >
                              <option value="Published">Published</option>
                              <option value="Hidden">Hidden</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                            <Button size="sm" onClick={saveEdit} disabled={!editForm.name} className="bg-neutral-900 text-white">Save</Button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 flex items-center justify-center">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-neutral-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {cat.name}
                          {cat.description && <p className="text-xs text-neutral-500 font-normal truncate max-w-[200px] mt-0.5">{cat.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-xs font-medium">
                            {getProductCount(cat.id)} items
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            cat.status === 'Published' ? 'bg-green-50 text-green-700 border border-green-200' :
                            'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}>
                            {cat.status || 'Published'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => startEdit(cat)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-200 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(cat)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
