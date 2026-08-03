import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { SEO } from '../../components/SEO';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useMasterData } from '../../contexts/MasterDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  ArrowLeft, Save, Eye, Image as ImageIcon, Box, LayoutList, 
  Plus, X, Trash2, GripVertical, Check, Upload, Loader2, Search, Palette, ChevronDown
} from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { uploadService } from '../../services/uploadService';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, updateProduct, addProduct, deleteProduct } = useAdminData();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { 
    fabrics, 
    colors: masterColors, 
    fits, 
    lengths, 
    addFabric, 
    addColor, 
    addFit, 
    addLength 
  } = useMasterData();
  const { showToast, error: showError } = useToast();

  const isNew = id === 'new';
  const existingProduct = isNew ? null : products.find(p => p.id === id);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Main Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    patternNumber: '',
    categoryId: categories[0]?.id || '',
    fabric: '',
    fit: '',
    length: '',
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
  };

  // --- AUTOCOMPLETE STATES ---
  // Fabric Autocomplete
  const [fabricSearch, setFabricSearch] = useState('');
  const [showFabricDropdown, setShowFabricDropdown] = useState(false);
  const [isCreatingFabricModal, setIsCreatingFabricModal] = useState(false);
  const [newFabricName, setNewFabricName] = useState('');
  const [newFabricDesc, setNewFabricDesc] = useState('');

  // Fit Autocomplete
  const [fitSearch, setFitSearch] = useState('');
  const [showFitDropdown, setShowFitDropdown] = useState(false);
  const [isCreatingFitModal, setIsCreatingFitModal] = useState(false);
  const [newFitName, setNewFitName] = useState('');
  const [newFitDesc, setNewFitDesc] = useState('');

  // Length Autocomplete
  const [lengthSearch, setLengthSearch] = useState('');
  const [showLengthDropdown, setShowLengthDropdown] = useState(false);
  const [isCreatingLengthModal, setIsCreatingLengthModal] = useState(false);
  const [newLengthName, setNewLengthName] = useState('');
  const [newLengthDesc, setNewLengthDesc] = useState('');

  // Color Selection State
  const [colorSearch, setColorSearch] = useState('');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [selectedMasterColor, setSelectedMasterColor] = useState<{ name: string; hexCode: string; rgb?: string } | null>(null);
  const [colorStock, setColorStock] = useState<number>(100);
  const [isCreatingColorModal, setIsCreatingColorModal] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorRgb, setNewColorRgb] = useState('0, 0, 0');

  // Initialize autocomplete search terms from formData when loaded
  useEffect(() => {
    if (formData.fabric) setFabricSearch(formData.fabric);
    if (formData.fit) setFitSearch(formData.fit);
    if (formData.length) setLengthSearch(formData.length);
  }, [formData.fabric, formData.fit, formData.length]);

  // --- MODAL CREATION HANDLERS ---
  const handleCreateFabric = async () => {
    if (!newFabricName.trim()) {
      showToast('Fabric name is required.', 'error');
      return;
    }
    try {
      const created = await addFabric({ name: newFabricName.trim(), description: newFabricDesc.trim(), isActive: true });
      handleChange('fabric', created.name);
      setFabricSearch(created.name);
      setIsCreatingFabricModal(false);
      setNewFabricName('');
      setNewFabricDesc('');
      showToast(`Fabric "${created.name}" created and selected!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create fabric.', 'error');
    }
  };

  const handleCreateFit = async () => {
    if (!newFitName.trim()) {
      showToast('Fit name is required.', 'error');
      return;
    }
    try {
      const created = await addFit({ name: newFitName.trim(), description: newFitDesc.trim(), isActive: true });
      handleChange('fit', created.name);
      setFitSearch(created.name);
      setIsCreatingFitModal(false);
      setNewFitName('');
      setNewFitDesc('');
      showToast(`Fit "${created.name}" created and selected!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create fit.', 'error');
    }
  };

  const handleCreateLength = async () => {
    if (!newLengthName.trim()) {
      showToast('Length name is required.', 'error');
      return;
    }
    try {
      const created = await addLength({ name: newLengthName.trim(), description: newLengthDesc.trim(), isActive: true });
      handleChange('length', created.name);
      setLengthSearch(created.name);
      setIsCreatingLengthModal(false);
      setNewLengthName('');
      setNewLengthDesc('');
      showToast(`Length "${created.name}" created and selected!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create length.', 'error');
    }
  };

  const handleCreateColor = async () => {
    if (!newColorName.trim()) {
      showToast('Color name is required.', 'error');
      return;
    }
    try {
      const created = await addColor({ name: newColorName.trim(), hexCode: newColorHex, rgb: newColorRgb, isActive: true });
      setSelectedMasterColor({ name: created.name, hexCode: created.hexCode, rgb: created.rgb });
      setColorSearch(created.name);
      setIsCreatingColorModal(false);
      setNewColorName('');
      setNewColorHex('#000000');
      setNewColorRgb('0, 0, 0');
      showToast(`Color "${created.name}" created and selected!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create color.', 'error');
    }
  };

  // --- ADD SELECTED COLOR TO PRODUCT ---
  const handleAddSelectedColorToProduct = () => {
    if (!selectedMasterColor) {
      showToast('Please search and select a color first.', 'error');
      return;
    }
    const currentColors = formData.colors || [];
    if (currentColors.some(c => c.name.toLowerCase() === selectedMasterColor.name.toLowerCase())) {
      showToast(`Color "${selectedMasterColor.name}" is already added to this product.`, 'error');
      return;
    }

    const updated = [...currentColors, { name: selectedMasterColor.name, hex: selectedMasterColor.hexCode, stock: Math.max(0, colorStock) }];
    handleChange('colors', updated);
    setSelectedMasterColor(null);
    setColorSearch('');
    setColorStock(100);
    showToast(`Color "${selectedMasterColor.name}" added to product.`, 'success');
  };

  const updateColorStock = (index: number, stockVal: number) => {
    const updatedColors = [...(formData.colors || [])];
    if (updatedColors[index]) {
      updatedColors[index] = { ...updatedColors[index], stock: Math.max(0, stockVal) };
      handleChange('colors', updatedColors);
    }
  };

  const removeColor = (index: number) => {
    const newColors = [...(formData.colors || [])];
    newColors.splice(index, 1);
    handleChange('colors', newColors);
  };

  // --- IMAGE MANAGEMENT ---
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
      showToast('Images uploaded successfully.', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showError('Failed to upload images');
    } finally {
      setIsUploading(false);
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
    }
    newImages.splice(index, 1);
    handleChange('images', newImages);
  };

  const setAsThumbnail = (index: number) => {
    if (index === 0) return;
    const newImages = [...(formData.images || [])];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    handleChange('images', newImages);
    showToast('Primary thumbnail updated.', 'success');
  };

  const handleDeleteProduct = async () => {
    if (!id || isNew) return;
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      showToast('Product deleted successfully.', 'success');
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // --- SAVE / PUBLISH HANDLER ---
  const handleSave = async (statusOverride?: 'Published' | 'Draft' | 'Hidden') => {
    if (!formData.patternNumber || formData.patternNumber.trim() === '') {
      showError('Pattern Number is required');
      return;
    }

    if (isNew) {
      const duplicate = products.find(p => p.patternNumber?.toLowerCase() === formData.patternNumber?.toLowerCase());
      if (duplicate) {
        showError('Pattern Number already exists');
        return;
      }
    } else {
      const duplicate = products.find(p => p.id !== id && p.patternNumber?.toLowerCase() === formData.patternNumber?.toLowerCase());
      if (duplicate) {
        showError('Pattern Number already exists');
        return;
      }
    }

    if (!formData.fabric || formData.fabric.trim() === '') {
      showError('Fabric selection is required');
      return;
    }

    if (!formData.categoryId) {
      showError('Category is required');
      return;
    }

    if (!formData.colors || formData.colors.length === 0) {
      showError('At least one color is required');
      return;
    }

    if (statusOverride === 'Published' && (!formData.images || formData.images.length === 0)) {
      showError('At least one product image is required before publishing');
      return;
    }

    setIsSaving(true);

    const openingInventory: Record<string, number> = {};
    formData.colors.forEach(c => {
      openingInventory[c.name] = typeof c.stock === 'number' ? c.stock : 0;
    });

    const categoryObj = categories.find(c => c.id === formData.categoryId);

    const finalData = { 
      ...formData, 
      categoryName: categoryObj?.name || '',
      openingInventory,
      ...(statusOverride ? { status: statusOverride } : {})
    };

    try {
      if (isNew) {
        await addProduct(finalData as any);
        showToast('Product created successfully!', 'success');
        navigate('/admin/products');
      } else {
        await updateProduct(id!, finalData);
        setFormData(finalData);
        showToast('Product updated successfully!', 'success');
      }
    } catch (error) {
      showError('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isNew && !existingProduct) {
    return <div className="p-8">Product not found</div>;
  }

  // Filter autocomplete lists
  const filteredFabrics = fabrics
    .filter(f => f.isActive)
    .filter(f => f.name.toLowerCase().includes(fabricSearch.toLowerCase()));

  const filteredFits = fits
    .filter(f => f.isActive)
    .filter(f => f.name.toLowerCase().includes(fitSearch.toLowerCase()));

  const filteredLengths = lengths
    .filter(l => l.isActive)
    .filter(l => l.name.toLowerCase().includes(lengthSearch.toLowerCase()));

  const filteredColors = masterColors
    .filter(c => c.isActive)
    .filter(c => c.name.toLowerCase().includes(colorSearch.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-8 p-4 md:p-6">
      <SEO title={isNew ? "New Product - Business Portal" : `Edit ${formData.patternNumber} - Business Portal`} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/products')}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif font-bold tracking-tight">
                {isNew ? 'Create New Product' : `Edit ${formData.patternNumber}`}
              </h1>
              {!isNew && (
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  formData.status === 'Published' ? 'bg-green-100 text-green-800' :
                  formData.status === 'Hidden' ? 'bg-neutral-100 text-neutral-600' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {formData.status || 'Draft'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Master Data Linked Catalog Creation Workflow</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Button 
                variant="outline" 
                onClick={() => window.open(`/product/${id}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-1.5" /> Retailer Preview
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
            </>
          )}
          <Button 
            variant="outline"
            onClick={() => handleSave('Draft')}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('Published')}
            disabled={isSaving}
            className="uppercase tracking-[1px] font-bold"
          >
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Publishing...' : 'Publish Product'}
          </Button>
        </div>
      </div>

      {/* FORM SECTIONS */}
      <div className="space-y-8">

        {/* SECTION 1: BASIC DETAILS */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">1</span>
              SECTION 1 — Basic Details
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Select standardized master fabrics, fits, and lengths.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pattern Number */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Pattern Number *</label>
              <Input 
                value={formData.patternNumber || ''} 
                onChange={e => handleChange('patternNumber', e.target.value)} 
                placeholder="e.g. MNFR-8802"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Category *</label>
              <select 
                value={formData.categoryId || ''}
                onChange={e => handleChange('categoryId', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input text-xs bg-background"
              >
                <option value="" disabled>Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Fabric Autocomplete */}
            <div className="relative">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Fabric (Master) *</label>
              <div className="relative">
                <Input 
                  value={fabricSearch} 
                  onChange={e => {
                    setFabricSearch(e.target.value);
                    setShowFabricDropdown(true);
                  }}
                  onFocus={() => setShowFabricDropdown(true)}
                  placeholder="Type to search fabric (e.g. Slub Linen)..."
                  className="pr-8"
                />
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {/* Autocomplete Dropdown */}
              {showFabricDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
                  {filteredFabrics.length > 0 ? (
                    filteredFabrics.map(fab => (
                      <button
                        key={fab.id}
                        type="button"
                        onClick={() => {
                          handleChange('fabric', fab.name);
                          setFabricSearch(fab.name);
                          setShowFabricDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">{fab.name}</span>
                        {fab.description && <span className="text-[10px] text-muted-foreground">{fab.description}</span>}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-muted-foreground text-center">No matching fabric found</div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowFabricDropdown(false);
                      setNewFabricName(fabricSearch);
                      setIsCreatingFabricModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 border-t border-border flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Fabric "{fabricSearch || '...'}"
                  </button>
                </div>
              )}
            </div>

            {/* Fit Autocomplete */}
            <div className="relative">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Fit (Master)</label>
              <div className="relative">
                <Input 
                  value={fitSearch} 
                  onChange={e => {
                    setFitSearch(e.target.value);
                    setShowFitDropdown(true);
                  }}
                  onFocus={() => setShowFitDropdown(true)}
                  placeholder="Type fit (e.g. Regular Fit, Loose Fit)..."
                  className="pr-8"
                />
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {/* Fit Dropdown */}
              {showFitDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
                  {filteredFits.length > 0 ? (
                    filteredFits.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          handleChange('fit', f.name);
                          setFitSearch(f.name);
                          setShowFitDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">{f.name}</span>
                        {f.description && <span className="text-[10px] text-muted-foreground">{f.description}</span>}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-muted-foreground text-center">No matching fit found</div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowFitDropdown(false);
                      setNewFitName(fitSearch);
                      setIsCreatingFitModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 border-t border-border flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Fit "{fitSearch || '...'}"
                  </button>
                </div>
              )}
            </div>

            {/* Length Autocomplete */}
            <div className="relative">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Length (Master)</label>
              <div className="relative">
                <Input 
                  value={lengthSearch} 
                  onChange={e => {
                    setLengthSearch(e.target.value);
                    setShowLengthDropdown(true);
                  }}
                  onFocus={() => setShowLengthDropdown(true)}
                  placeholder="Type length (e.g. Ankle Length, Capri)..."
                  className="pr-8"
                />
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {/* Length Dropdown */}
              {showLengthDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
                  {filteredLengths.length > 0 ? (
                    filteredLengths.map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          handleChange('length', l.name);
                          setLengthSearch(l.name);
                          setShowLengthDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">{l.name}</span>
                        {l.description && <span className="text-[10px] text-muted-foreground">{l.description}</span>}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-muted-foreground text-center">No matching length found</div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowLengthDropdown(false);
                      setNewLengthName(lengthSearch);
                      setIsCreatingLengthModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 border-t border-border flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Length "{lengthSearch || '...'}"
                  </button>
                </div>
              )}
            </div>

            {/* Wholesale Price */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Wholesale Price (₹) *</label>
              <Input 
                type="number"
                value={formData.price || 0} 
                onChange={e => handleChange('price', parseFloat(e.target.value) || 0)} 
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Description</label>
              <textarea 
                value={formData.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full min-h-[90px] p-3 rounded-lg border border-input text-xs bg-background focus:ring-2 focus:ring-foreground focus:outline-none"
                placeholder="Product design and specifications..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: COLORS & INVENTORY */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">2</span>
              SECTION 2 — Color Selection & Opening Inventory
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select standardized colors from Color Master and set initial stock sets per color.
            </p>
          </div>

          {/* Color Selection Bar */}
          <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.5px] text-foreground">Choose Existing Color or Create New</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              {/* Color Autocomplete */}
              <div className="relative sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Search Color Master *</label>
                <div className="relative">
                  <Input 
                    value={colorSearch}
                    onChange={e => {
                      setColorSearch(e.target.value);
                      setShowColorDropdown(true);
                      setSelectedMasterColor(null);
                    }}
                    onFocus={() => setShowColorDropdown(true)}
                    placeholder="Type color (e.g. Beige, Black, Blue)..."
                  />
                  {selectedMasterColor && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-background border border-border rounded text-xs">
                      <div className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: selectedMasterColor.hexCode }} />
                      <span className="font-bold">{selectedMasterColor.name}</span>
                    </div>
                  )}
                </div>

                {/* Dropdown */}
                {showColorDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
                    {filteredColors.length > 0 ? (
                      filteredColors.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedMasterColor({ name: c.name, hexCode: c.hexCode, rgb: c.rgb });
                            setColorSearch(c.name);
                            setShowColorDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-3"
                        >
                          <div className="w-5 h-5 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: c.hexCode }} />
                          <span className="font-bold text-foreground">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{c.hexCode}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-muted-foreground text-center">No color found</div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowColorDropdown(false);
                        setNewColorName(colorSearch);
                        setIsCreatingColorModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 border-t border-border flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Create New Color "{colorSearch || '...'}"
                    </button>
                  </div>
                )}
              </div>

              {/* Initial Stock */}
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Opening Stock (Sets)</label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    min="0"
                    value={colorStock}
                    onChange={e => setColorStock(parseInt(e.target.value) || 0)}
                    className="font-mono text-xs"
                  />
                  <Button type="button" onClick={handleAddSelectedColorToProduct} className="text-xs uppercase font-bold whitespace-nowrap">
                    Add Color
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Added Colors Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.5px] text-foreground">Configured Product Colors ({formData.colors?.length || 0})</h3>
            {formData.colors && formData.colors.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                {formData.colors.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card hover:bg-muted/10 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-border shadow-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="font-bold text-foreground text-sm">{c.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{c.hex}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Inventory:</span>
                        <Input 
                          type="number"
                          min="0"
                          value={typeof c.stock === 'number' ? c.stock : 0}
                          onChange={e => updateColorStock(idx, parseInt(e.target.value) || 0)}
                          className="w-24 h-8 text-xs text-right font-mono"
                        />
                        <span className="text-muted-foreground font-medium">sets</span>
                      </div>
                      <button onClick={() => removeColor(idx)} className="p-1 hover:bg-red-50 text-red-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground">
                No colors selected yet. Search and add at least one color above.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: IMAGES */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">3</span>
              SECTION 3 — Product Images
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Upload product photography. The primary thumbnail will represent this item in retailer search.
            </p>
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/20 transition-colors cursor-pointer relative overflow-hidden">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                <span className="text-xs font-bold text-foreground">Uploading images to storage...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground/60" />
                <span className="text-xs font-bold uppercase tracking-[1px] text-foreground">Click or Drag Images to Upload</span>
                <span className="text-[10px] text-muted-foreground">Supports PNG, JPG, WEBP formats</span>
              </div>
            )}
          </label>

          {/* Image Grid */}
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg border border-border overflow-hidden aspect-[3/4] bg-muted">
                  <img src={img} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {idx !== 0 && (
                      <button 
                        type="button"
                        onClick={() => setAsThumbnail(idx)} 
                        className="bg-white text-neutral-900 text-[10px] font-bold px-2 py-1 rounded shadow"
                      >
                        Set Thumbnail
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)} 
                      className="p-1.5 bg-red-600 text-white rounded shadow hover:bg-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[9px] uppercase font-bold tracking-[1px] px-2 py-0.5 rounded">
                      Thumbnail
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: PUBLISH */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">4</span>
              SECTION 4 — Publish & Catalog Status
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Save as draft to refine later or publish immediately for all active retailers.
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => handleSave('Draft')} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Save Draft
            </Button>
            <Button 
              type="button"
              onClick={() => handleSave('Published')} 
              disabled={isSaving}
              className="flex-1 sm:flex-none uppercase tracking-[1px] font-bold px-6"
            >
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Publish Product'}
            </Button>
          </div>
        </div>

      </div>

      {/* --- MODALS FOR CREATING NEW MASTER DATA ON THE FLY --- */}

      {/* Create Fabric Modal */}
      {isCreatingFabricModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base border-b border-border pb-2">+ Create New Fabric</h3>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Fabric Name *</label>
              <Input value={newFabricName} onChange={e => setNewFabricName(e.target.value)} placeholder="e.g. Slub Linen" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Description (Optional)</label>
              <Input value={newFabricDesc} onChange={e => setNewFabricDesc(e.target.value)} placeholder="e.g. 100% Breathable Weave" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreatingFabricModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateFabric} className="uppercase font-bold">Create Fabric</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Fit Modal */}
      {isCreatingFitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base border-b border-border pb-2">+ Create New Fit</h3>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Fit Name *</label>
              <Input value={newFitName} onChange={e => setNewFitName(e.target.value)} placeholder="e.g. Regular Fit" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Description (Optional)</label>
              <Input value={newFitDesc} onChange={e => setNewFitDesc(e.target.value)} placeholder="e.g. Standard straight cut" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreatingFitModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateFit} className="uppercase font-bold">Create Fit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Length Modal */}
      {isCreatingLengthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base border-b border-border pb-2">+ Create New Length</h3>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Length Name *</label>
              <Input value={newLengthName} onChange={e => setNewLengthName(e.target.value)} placeholder="e.g. Ankle Length" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Description (Optional)</label>
              <Input value={newLengthDesc} onChange={e => setNewLengthDesc(e.target.value)} placeholder="e.g. Full bottom drop" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreatingLengthModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateLength} className="uppercase font-bold">Create Length</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Color Modal */}
      {isCreatingColorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base border-b border-border pb-2">+ Create New Color</h3>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Color Name *</label>
              <Input value={newColorName} onChange={e => setNewColorName(e.target.value)} placeholder="e.g. Dark Grey" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Hex Code</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={newColorHex} 
                    onChange={e => {
                      const hex = e.target.value;
                      const r = parseInt(hex.slice(1, 3), 16);
                      const g = parseInt(hex.slice(3, 5), 16);
                      const b = parseInt(hex.slice(5, 7), 16);
                      setNewColorHex(hex);
                      setNewColorRgb(`${r}, ${g}, ${b}`);
                    }}
                    className="w-9 h-9 rounded border cursor-pointer bg-transparent p-0" 
                  />
                  <Input value={newColorHex} onChange={e => setNewColorHex(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">RGB Value</label>
                <Input value={newColorRgb} onChange={e => setNewColorRgb(e.target.value)} placeholder="0, 0, 0" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreatingColorModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateColor} className="uppercase font-bold">Create Color</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product?"
        description={`Are you sure you want to delete product "${formData.patternNumber || ''}"? All inventory records and images will be permanently removed.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
