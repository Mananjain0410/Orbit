import React, { useState } from 'react';
import { SEO } from '../../components/SEO';
import { useAdminData } from '../../contexts/AdminDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Upload, Save, X, Check } from 'lucide-react';
import { Category } from '../../types';
import { uploadService } from '../../services/uploadService';
import { auditLogService } from '../../services/auditLogService';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminCategories() {
  const { categories, products, updateCategory, addCategory, deleteCategory } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Category>>({ 
    name: '', 
    description: '', 
    status: 'Published',
    image: '',
    thumbnail: '',
    displayImage: '',
    mobileImage: ''
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const handleImageUpload = async (
    file: File, 
    field: 'image' | 'thumbnail' | 'displayImage' | 'mobileImage',
    isEdit: boolean
  ) => {
    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file format.', 'error');
      return;
    }

    setUploadingField(`${isEdit ? 'edit' : 'add'}_${field}`);
    showToast(`Uploading ${field} to Firebase Storage...`, 'info');

    try {
      const url = await uploadService.uploadImage(file, 'categories');
      if (isEdit) {
        const oldUrl = editForm[field];
        setEditForm(prev => ({ ...prev, [field]: url }));
        if (oldUrl && oldUrl !== url) {
          await uploadService.deleteImage(oldUrl);
        }
      } else {
        setAddForm(prev => ({ ...prev, [field]: url }));
      }
      showToast(`${field} uploaded successfully!`, 'success');
    } catch (err) {
      console.error(`Failed to upload ${field}:`, err);
      showToast(`Upload failed for ${field}.`, 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const startEdit = (cat: Category) => {
    setIsEditing(cat.id);
    setEditForm({ ...cat });
  };

  const saveEdit = async () => {
    if (isEditing && editForm.name) {
      const oldCat = categories.find(c => c.id === isEditing);
      await updateCategory(isEditing, editForm);
      await auditLogService.logAction('category_edited', `Updated category: ${editForm.name}`, isEditing, oldCat, editForm);
      showToast('Category updated and synced!', 'success');
      setIsEditing(null);
    }
  };

  const saveAdd = async () => {
    if (addForm.name) {
      await addCategory(addForm as any);
      await auditLogService.logAction('category_created', `Created new category: ${addForm.name}`, '', null, addForm);
      showToast('Category created and added to catalog!', 'success');
      setIsAdding(false);
      setAddForm({ name: '', description: '', status: 'Published', image: '', thumbnail: '', displayImage: '', mobileImage: '' });
    }
  };

  const handleDeleteClick = (cat: Category) => {
    const count = getProductCount(cat.id);
    if (count > 0) {
      showToast(`Cannot delete this category because products are assigned to it.`, 'error');
      return;
    }
    setCategoryToDelete(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      await auditLogService.logAction('category_deleted', `Deleted category: ${categoryToDelete.name}`, categoryToDelete.id);
      showToast('Category deleted successfully.', 'success');
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      showToast(err.message || 'Failed to delete category.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <SEO title="Categories - Business Portal" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Category Thumbnail Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage collection graphics, thumbnails, display images, and mobile banners.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 uppercase tracking-[1px] font-bold">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="bg-card p-4 border border-border rounded-xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories by name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {isAdding && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-border pb-3">Add New Category</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Category Name *</label>
              <Input 
                value={addForm.name} 
                onChange={e => setAddForm({ ...addForm, name: e.target.value })} 
                placeholder="e.g. Trackpants & Lowers"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Status</label>
              <select 
                value={addForm.status}
                onChange={e => setAddForm({ ...addForm, status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg border border-input text-sm bg-background"
              >
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
              <Input 
                value={addForm.description || ''} 
                onChange={e => setAddForm({ ...addForm, description: e.target.value })} 
                placeholder="Short description for retailer navigation..."
              />
            </div>
          </div>

          {/* Category Images Management */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-[1px] mb-3 text-foreground">Category Images & Graphics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(['image', 'thumbnail', 'displayImage', 'mobileImage'] as const).map(field => (
                <div key={field} className="border border-border rounded-lg p-3 bg-muted/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground block capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="aspect-video bg-muted rounded overflow-hidden relative border border-border flex items-center justify-center">
                    {addForm[field] ? (
                      <img src={addForm[field]} alt={field} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-background border border-input hover:bg-muted text-xs py-1.5 px-3 rounded w-full flex items-center justify-center gap-1.5 font-medium">
                    <Upload className="w-3.5 h-3.5" /> 
                    {uploadingField === `add_${field}` ? 'Uploading...' : 'Choose File'}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], field, false)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 justify-end border-t border-border">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={saveAdd} disabled={!addForm.name} className="uppercase tracking-[1px] font-bold">
              Save Category
            </Button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-[0.5px]">
              <tr>
                <th className="px-4 py-3">Thumbnail</th>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Display & Mobile Assets</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/20">
                    {isEditing === cat.id ? (
                      <td colSpan={6} className="p-4 bg-muted/10">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input 
                              value={editForm.name} 
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                              placeholder="Category Name"
                            />
                            <Input 
                              value={editForm.description || ''} 
                              onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
                              placeholder="Description"
                            />
                            <select 
                              value={editForm.status}
                              onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                              className="h-10 px-3 rounded-lg border border-input text-xs bg-background"
                            >
                              <option value="Published">Published</option>
                              <option value="Hidden">Hidden</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(['image', 'thumbnail', 'displayImage', 'mobileImage'] as const).map(field => (
                              <div key={field} className="border border-border rounded p-2 bg-background space-y-2">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground block capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="aspect-square bg-muted rounded overflow-hidden relative flex items-center justify-center">
                                  {editForm[field] ? (
                                    <img src={editForm[field]} alt={field} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                                  )}
                                </div>
                                <label className="cursor-pointer bg-muted hover:bg-muted/80 text-[10px] py-1 px-2 rounded w-full flex items-center justify-center gap-1 font-semibold">
                                  <Upload className="w-3 h-3" />
                                  {uploadingField === `edit_${field}` ? '...' : 'Replace'}
                                  <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], field, true)} 
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 justify-end border-t border-border pt-3">
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                            <Button size="sm" onClick={saveEdit} className="uppercase tracking-[1px] font-bold">Save Changes</Button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border flex items-center justify-center">
                            {cat.thumbnail || cat.image || cat.displayImage ? (
                              <img src={cat.thumbnail || cat.image || cat.displayImage} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground">
                          {cat.name}
                          {cat.description && <p className="text-[11px] text-muted-foreground font-normal truncate max-w-[200px] mt-0.5">{cat.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 items-center">
                            {cat.image && <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">IMAGE</span>}
                            {cat.thumbnail && <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">THUMBNAIL</span>}
                            {cat.displayImage && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">DISPLAY</span>}
                            {cat.mobileImage && <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">MOBILE</span>}
                            {!cat.image && !cat.thumbnail && !cat.displayImage && !cat.mobileImage && (
                              <span className="text-[10px] text-muted-foreground italic">No assets</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-muted px-2 py-0.5 rounded text-[11px] font-medium text-foreground">
                            {getProductCount(cat.id)} items
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            cat.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                          }`}>
                            {cat.status || 'Published'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => startEdit(cat)}
                              className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                              title="Edit Category & Images"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(cat)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                              title="Delete Category"
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

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category?"
        description={`Are you sure you want to delete category "${categoryToDelete?.name || ''}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
