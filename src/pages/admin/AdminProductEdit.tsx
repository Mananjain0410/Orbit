import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { SEO } from '../../components/SEO';
import { useAdminData } from '../../contexts/AdminDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  ArrowLeft, Save, Eye, Image as ImageIcon, Box, LayoutList, 
  Plus, X, Trash2, GripVertical, Check, Upload, Loader2
} from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { uploadService } from '../../services/uploadService';
import { useToast } from '../../components/ui/Toast';

export function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, updateProduct, addProduct } = useAdminData();
  const { error: showError } = useToast();
  
  const isNew = id === 'new';
  const existingProduct = isNew ? null : products.find(p => p.id === id);

  const [activeTab, setActiveTab] = useState<'general' | 'images' | 'inventory'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    patternNumber: '',
    categoryId: categories[0]?.id || '',
    fabric: '',
    price: 0,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [],
    images: [],
    description: '',
    inStock: true,
    status: 'Draft',
    keywords: [],
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData(existingProduct);
    }
  }, [existingProduct]);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async (statusOverride?: 'Published' | 'Draft' | 'Hidden') => {
    // Validations
    if (!formData.patternNumber || formData.patternNumber.trim() === '') {
      showError('Pattern Number is required');
      return;
    }

    if (isNew) {
      // Check for duplicate pattern number
      const duplicate = products.find(p => p.patternNumber.toLowerCase() === formData.patternNumber?.toLowerCase());
      if (duplicate) {
        showError('Pattern Number already exists');
        return;
      }
    } else {
      const duplicate = products.find(p => p.id !== id && p.patternNumber.toLowerCase() === formData.patternNumber?.toLowerCase());
      if (duplicate) {
        showError('Pattern Number already exists');
        return;
      }
    }

    if (!formData.fabric || formData.fabric.trim() === '') {
      showError('Product Name (Fabric) is required');
      return;
    }

    if (!formData.categoryId) {
      showError('Category is required');
      return;
    }

    if (!formData.sizes || formData.sizes.length === 0) {
      showError('At least one size is required');
      return;
    }

    if (!formData.colors || formData.colors.length === 0) {
      showError('At least one colour is required');
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      // Just warn, don't block
      console.warn('Product has no images. Retailers will not see any photos.');
    }

    setIsSaving(true);
    
    const finalData = { 
      ...formData, 
      ...(statusOverride ? { status: statusOverride } : {})
    };

    try {
      if (isNew) {
        await addProduct(finalData as any);
        navigate('/admin/products');
      } else {
        await updateProduct(id!, finalData);
        setFormData(finalData);
        setHasChanges(false);
      }
    } catch (error) {
      showError('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // Color Management
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  
  const addColor = () => {
    if (newColorName && newColorHex) {
      handleChange('colors', [...(formData.colors || []), { name: newColorName, hex: newColorHex }]);
      setNewColorName('');
      setNewColorHex('#000000');
    }
  };
  
  const removeColor = (index: number) => {
    const newColors = [...(formData.colors || [])];
    newColors.splice(index, 1);
    handleChange('colors', newColors);
  };

  // Size Management
  const [newSize, setNewSize] = useState('');
  
  const addSize = () => {
    if (newSize) {
      handleChange('sizes', [...(formData.sizes || []), newSize]);
      setNewSize('');
    }
  };

  const removeSize = (index: number) => {
    const newSizes = [...(formData.sizes || [])];
    newSizes.splice(index, 1);
    handleChange('sizes', newSizes);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      const newImages = [...(formData.images || [])];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const url = await uploadService.uploadImage(file);
        newImages.push(url);
      }
      
      handleChange('images', newImages);
    } catch (error) {
      console.error('Upload failed:', error);
      showError('Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const newImages = [...(formData.images || [])];
    const urlToRemove = newImages[index];
    
    try {
      await uploadService.deleteImage(urlToRemove);
    } catch (error) {
      console.error('Failed to delete from storage', error);
      // We still remove from UI even if storage delete fails
    }
    
    newImages.splice(index, 1);
    handleChange('images', newImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === (formData.images?.length || 0) - 1) return;
    
    const newImages = [...(formData.images || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    handleChange('images', newImages);
  };

  if (!isNew && !existingProduct) {
    return <div className="p-8">Product not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <SEO title={isNew ? "New Product - Business Portal" : `Edit ${formData.patternNumber} - Business Portal`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/products')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">
                {isNew ? 'Create New Product' : formData.patternNumber}
              </h1>
              {!isNew && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  formData.status === 'Published' ? 'bg-green-50 text-green-700 border border-green-200' :
                  formData.status === 'Hidden' ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {formData.status || 'Draft'}
                </span>
              )}
            </div>
            {hasChanges && <p className="text-xs text-amber-600 font-medium mt-0.5">Unsaved changes</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={() => window.open(`/product/${id}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" /> Preview as Retailer
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => handleSave('Draft')}
            disabled={isSaving}
            className="bg-white"
          >
            Save as Draft
          </Button>
          <Button 
            onClick={() => handleSave('Published')}
            disabled={isSaving}
            className="bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Navigation Tabs (Sidebar on desktop) */}
        <div className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-neutral-200 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'general' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
              `}
            >
              <LayoutList className="w-4 h-4" /> General Info
            </button>
            <button 
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'images' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
              `}
            >
              <ImageIcon className="w-4 h-4" /> Images & Media
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'inventory' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
              `}
            >
              <Box className="w-4 h-4" /> Inventory & Stock
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-medium border-b border-neutral-100 pb-4">Basic Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Pattern Number *</label>
                    <Input 
                      value={formData.patternNumber} 
                      onChange={e => handleChange('patternNumber', e.target.value)} 
                      placeholder="e.g. KRT-1024"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Category *</label>
                    <select 
                      value={formData.categoryId}
                      onChange={e => handleChange('categoryId', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => handleChange('description', e.target.value)}
                      className="w-full min-h-[100px] p-3 rounded-lg border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                      placeholder="Detailed product description..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-medium border-b border-neutral-100 pb-4">Product Attributes</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Fabric</label>
                    <Input 
                      value={formData.fabric} 
                      onChange={e => handleChange('fabric', e.target.value)} 
                      placeholder="e.g. Premium Cotton Blend"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Wholesale Price (₹) *</label>
                    <Input 
                      type="number"
                      value={formData.price} 
                      onChange={e => handleChange('price', parseFloat(e.target.value))} 
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3 pt-4">
                  <label className="text-sm font-medium text-neutral-700">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes?.map((size, index) => (
                      <div key={index} className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg text-sm">
                        <span>{size}</span>
                        <button onClick={() => removeSize(index)} className="text-neutral-400 hover:text-red-500 ml-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newSize} 
                      onChange={e => setNewSize(e.target.value)} 
                      placeholder="New Size (e.g. 3XL)" 
                      className="max-w-[200px]"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    />
                    <Button type="button" onClick={addSize} variant="outline" className="bg-white">Add Size</Button>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  <label className="text-sm font-medium text-neutral-700">Available Colors</label>
                  <div className="flex flex-wrap gap-3">
                    {formData.colors?.map((color, index) => (
                      <div key={index} className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg text-sm">
                        <div className="w-4 h-4 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex }}></div>
                        <span>{color.name}</span>
                        <button onClick={() => removeColor(index)} className="text-neutral-400 hover:text-red-500 ml-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={newColorHex} 
                      onChange={e => setNewColorHex(e.target.value)} 
                      className="w-10 h-10 p-1 rounded border border-neutral-200 cursor-pointer"
                    />
                    <Input 
                      value={newColorName} 
                      onChange={e => setNewColorName(e.target.value)} 
                      placeholder="Color Name" 
                      className="max-w-[150px]"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    />
                    <Button type="button" onClick={addColor} variant="outline" className="bg-white">Add Color</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-medium border-b border-neutral-100 pb-4">Product Images</h2>
              <p className="text-sm text-neutral-500">Upload high-quality images. The first image will be used as the product thumbnail.</p>
              
              <label className="border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <>
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                      <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
                    </div>
                    <p className="font-medium text-neutral-700">Uploading images...</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="font-medium text-neutral-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-neutral-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                  </>
                )}
              </label>

              {/* Image Gallery */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group rounded-lg border border-neutral-200 overflow-hidden aspect-[3/4]">
                      <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index > 0 && (
                          <button 
                            onClick={(e) => { e.preventDefault(); moveImage(index, 'up'); }}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-neutral-900 hover:bg-neutral-100" 
                            title="Make Primary"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.preventDefault(); removeImage(index); }}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 hover:bg-red-50" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-neutral-900 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium">
                          Thumbnail
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-medium border-b border-neutral-100 pb-4">Inventory Status</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                  <input 
                    type="radio" 
                    name="inventory" 
                    checked={formData.inStock === true} 
                    onChange={() => handleChange('inStock', true)}
                    className="w-4 h-4 text-neutral-900 focus:ring-neutral-900" 
                  />
                  <div>
                    <p className="font-medium text-neutral-900">In Stock</p>
                    <p className="text-sm text-neutral-500">Product is available for wholesale ordering.</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                  <input 
                    type="radio" 
                    name="inventory" 
                    checked={formData.inStock === false} 
                    onChange={() => handleChange('inStock', false)}
                    className="w-4 h-4 text-neutral-900 focus:ring-neutral-900" 
                  />
                  <div>
                    <p className="font-medium text-neutral-900">Out of Stock</p>
                    <p className="text-sm text-neutral-500">Product will show as Out of Stock to retailers.</p>
                  </div>
                </label>
              </div>
              
              <div className="pt-6 border-t border-neutral-100">
                <p className="text-sm text-neutral-500 italic flex items-center gap-2">
                  Detailed SKU-level inventory tracking will be available in Phase 3.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
