import React, { useState } from 'react';
import { SEO } from '../../components/SEO';
import { useMasterData } from '../../contexts/MasterDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Check, X, Palette, Layers, Scissors, Maximize2, Tag } from 'lucide-react';
import { MasterFabric, MasterColor, MasterFit, MasterLength, MasterSize } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { auditLogService } from '../../services/auditLogService';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

type TabType = 'fabrics' | 'colors' | 'fits' | 'lengths' | 'sizes';

export function AdminMasterData() {
  const {
    fabrics,
    colors,
    fits,
    lengths,
    sizes,
    addFabric,
    updateFabric,
    deleteFabric,
    addColor,
    updateColor,
    deleteColor,
    addFit,
    updateFit,
    deleteFit,
    addLength,
    updateLength,
    deleteLength,
    addSize,
    updateSize,
    deleteSize
  } = useMasterData();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('fabrics');
  const [searchTerm, setSearchTerm] = useState('');

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<{ type: TabType; item: any } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Active Add State
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<any>({});

  // Reset forms on tab switch
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setEditingId(null);
    setIsAdding(false);
    setAddForm({});
  };

  // Helper for duplicate validation message
  const handleActionError = (err: any) => {
    console.error('Master data action error:', err);
    showToast(err.message || 'Action failed. Please try again.', 'error');
  };

  // --- FABRIC HANDLERS ---
  const handleAddFabric = async () => {
    if (!addForm.name?.trim()) {
      showToast('Fabric name is required.', 'error');
      return;
    }
    try {
      await addFabric({
        name: addForm.name.trim(),
        description: addForm.description || '',
        isActive: addForm.isActive ?? true
      });
      await auditLogService.logAction('master_fabric_created', `Added Fabric: ${addForm.name}`);
      showToast('Fabric added successfully!', 'success');
      setIsAdding(false);
      setAddForm({});
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleUpdateFabric = async (id: string) => {
    if (!editForm.name?.trim()) {
      showToast('Fabric name is required.', 'error');
      return;
    }
    try {
      await updateFabric(id, {
        name: editForm.name.trim(),
        description: editForm.description || '',
        isActive: editForm.isActive
      });
      await auditLogService.logAction('master_fabric_updated', `Updated Fabric: ${editForm.name}`);
      showToast('Fabric updated.', 'success');
      setEditingId(null);
    } catch (err) {
      handleActionError(err);
    }
  };

  // --- COLOR HANDLERS ---
  const handleAddColor = async () => {
    if (!addForm.name?.trim()) {
      showToast('Color name is required.', 'error');
      return;
    }
    try {
      await addColor({
        name: addForm.name.trim(),
        hexCode: addForm.hexCode || '#000000',
        rgb: addForm.rgb || '0, 0, 0',
        displayOrder: addForm.displayOrder ? Number(addForm.displayOrder) : undefined,
        isActive: addForm.isActive ?? true
      });
      await auditLogService.logAction('master_color_created', `Added Color: ${addForm.name}`);
      showToast('Color added successfully!', 'success');
      setIsAdding(false);
      setAddForm({});
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleUpdateColor = async (id: string) => {
    if (!editForm.name?.trim()) {
      showToast('Color name is required.', 'error');
      return;
    }
    try {
      await updateColor(id, {
        name: editForm.name.trim(),
        hexCode: editForm.hexCode,
        rgb: editForm.rgb,
        displayOrder: editForm.displayOrder ? Number(editForm.displayOrder) : undefined,
        isActive: editForm.isActive
      });
      await auditLogService.logAction('master_color_updated', `Updated Color: ${editForm.name}`);
      showToast('Color updated.', 'success');
      setEditingId(null);
    } catch (err) {
      handleActionError(err);
    }
  };

  // --- FIT HANDLERS ---
  const handleAddFit = async () => {
    if (!addForm.name?.trim()) {
      showToast('Fit name is required.', 'error');
      return;
    }
    try {
      await addFit({
        name: addForm.name.trim(),
        description: addForm.description || '',
        isActive: addForm.isActive ?? true
      });
      await auditLogService.logAction('master_fit_created', `Added Fit: ${addForm.name}`);
      showToast('Fit added successfully!', 'success');
      setIsAdding(false);
      setAddForm({});
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleUpdateFit = async (id: string) => {
    if (!editForm.name?.trim()) {
      showToast('Fit name is required.', 'error');
      return;
    }
    try {
      await updateFit(id, {
        name: editForm.name.trim(),
        description: editForm.description || '',
        isActive: editForm.isActive
      });
      await auditLogService.logAction('master_fit_updated', `Updated Fit: ${editForm.name}`);
      showToast('Fit updated.', 'success');
      setEditingId(null);
    } catch (err) {
      handleActionError(err);
    }
  };

  // --- LENGTH HANDLERS ---
  const handleAddLength = async () => {
    if (!addForm.name?.trim()) {
      showToast('Length name is required.', 'error');
      return;
    }
    try {
      await addLength({
        name: addForm.name.trim(),
        description: addForm.description || '',
        isActive: addForm.isActive ?? true
      });
      await auditLogService.logAction('master_length_created', `Added Length: ${addForm.name}`);
      showToast('Length added successfully!', 'success');
      setIsAdding(false);
      setAddForm({});
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleUpdateLength = async (id: string) => {
    if (!editForm.name?.trim()) {
      showToast('Length name is required.', 'error');
      return;
    }
    try {
      await updateLength(id, {
        name: editForm.name.trim(),
        description: editForm.description || '',
        isActive: editForm.isActive
      });
      await auditLogService.logAction('master_length_updated', `Updated Length: ${editForm.name}`);
      showToast('Length updated.', 'success');
      setEditingId(null);
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleAddSize = async () => {
    if (!addForm.name?.trim()) {
      showToast('Size name is required.', 'error');
      return;
    }
    try {
      await addSize({
        name: addForm.name.trim(),
        description: addForm.description || '',
        displayOrder: addForm.displayOrder ? Number(addForm.displayOrder) : undefined,
        isActive: addForm.isActive ?? true
      });
      await auditLogService.logAction('master_size_created', `Added Size: ${addForm.name}`);
      showToast('Size added successfully!', 'success');
      setIsAdding(false);
      setAddForm({});
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleUpdateSize = async (id: string) => {
    if (!editForm.name?.trim()) {
      showToast('Size name is required.', 'error');
      return;
    }
    try {
      await updateSize(id, {
        name: editForm.name.trim(),
        description: editForm.description || '',
        displayOrder: editForm.displayOrder ? Number(editForm.displayOrder) : undefined,
        isActive: editForm.isActive
      });
      await auditLogService.logAction('master_size_updated', `Updated Size: ${editForm.name}`);
      showToast('Size updated.', 'success');
      setEditingId(null);
    } catch (err) {
      handleActionError(err);
    }
  };

  const handleDeleteFabric = (item: MasterFabric) => {
    setItemToDelete({ type: 'fabrics', item });
  };

  const handleDeleteColor = (item: MasterColor) => {
    setItemToDelete({ type: 'colors', item });
  };

  const handleDeleteFit = (item: MasterFit) => {
    setItemToDelete({ type: 'fits', item });
  };

  const handleDeleteLength = (item: MasterLength) => {
    setItemToDelete({ type: 'lengths', item });
  };

  const handleDeleteSize = (item: MasterSize) => {
    setItemToDelete({ type: 'sizes', item });
  };

  const confirmDeleteMasterItem = async () => {
    if (!itemToDelete) return;
    const { type, item } = itemToDelete;
    setIsDeleting(true);
    try {
      if (type === 'fabrics') {
        await deleteFabric(item.id);
        await auditLogService.logAction('master_fabric_deleted', `Deleted Fabric: ${item.name}`);
        showToast('Fabric deleted successfully.', 'success');
      } else if (type === 'colors') {
        await deleteColor(item.id);
        await auditLogService.logAction('master_color_deleted', `Deleted Color: ${item.name}`);
        showToast('Color deleted successfully.', 'success');
      } else if (type === 'fits') {
        await deleteFit(item.id);
        await auditLogService.logAction('master_fit_deleted', `Deleted Fit: ${item.name}`);
        showToast('Fit deleted successfully.', 'success');
      } else if (type === 'lengths') {
        await deleteLength(item.id);
        await auditLogService.logAction('master_length_deleted', `Deleted Length: ${item.name}`);
        showToast('Length deleted successfully.', 'success');
      } else if (type === 'sizes') {
        await deleteSize(item.id);
        await auditLogService.logAction('master_size_deleted', `Deleted Size: ${item.name}`);
        showToast('Size deleted successfully.', 'success');
      }
      setItemToDelete(null);
    } catch (err: any) {
      handleActionError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lists
  const filteredFabrics = fabrics.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredColors = colors.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFits = fits.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLengths = lengths.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSizes = sizes.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <SEO title="Master Data - Business Portal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Master Data Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Standardize fabrics, colors, fits, and lengths across the catalog to maintain clean inventory data.
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsAdding(true);
            setAddForm({ isActive: true, hexCode: '#000000', rgb: '0, 0, 0' });
          }} 
          className="flex items-center gap-2 uppercase tracking-[1px] font-bold"
        >
          <Plus className="w-4 h-4" /> Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange('fabrics')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'fabrics' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Scissors className="w-4 h-4" /> Fabrics ({fabrics.length})
        </button>
        <button
          onClick={() => handleTabChange('colors')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'colors' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4" /> Colors ({colors.length})
        </button>
        <button
          onClick={() => handleTabChange('fits')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'fits' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" /> Fits ({fits.length})
        </button>
        <button
          onClick={() => handleTabChange('lengths')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'lengths' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Maximize2 className="w-4 h-4" /> Lengths ({lengths.length})
        </button>
        <button
          onClick={() => handleTabChange('sizes')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'sizes' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Tag className="w-4 h-4" /> Sizes ({sizes.length})
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-card p-4 border border-border rounded-xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={`Search ${activeTab} by name...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* ADD NEW FORM PANEL */}
      {isAdding && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-bold text-base capitalize">Add New {activeTab.slice(0, -1)}</h3>
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Name *</label>
              <Input 
                value={addForm.name || ''} 
                onChange={e => setAddForm({ ...addForm, name: e.target.value })} 
                placeholder={`e.g. ${
                  activeTab === 'fabrics' ? 'Slub Linen' :
                  activeTab === 'colors' ? 'Olive Green' :
                  activeTab === 'fits' ? 'Loose Fit' :
                  activeTab === 'lengths' ? 'Ankle Length' : '2XL'
                }`}
              />
            </div>

            {activeTab === 'colors' && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Hex Code</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={addForm.hexCode || '#000000'}
                      onChange={e => {
                        const hex = e.target.value;
                        // Calculate approximate RGB
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        setAddForm({ ...addForm, hexCode: hex, rgb: `${r}, ${g}, ${b}` });
                      }}
                      className="w-10 h-10 rounded border cursor-pointer p-0 bg-transparent"
                    />
                    <Input 
                      value={addForm.hexCode || '#000000'} 
                      onChange={e => setAddForm({ ...addForm, hexCode: e.target.value })} 
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">RGB Value</label>
                  <Input 
                    value={addForm.rgb || '0, 0, 0'} 
                    onChange={e => setAddForm({ ...addForm, rgb: e.target.value })} 
                    placeholder="0, 0, 0"
                  />
                </div>
              </>
            )}

            {activeTab !== 'colors' && (
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Description (Optional)</label>
                <Input 
                  value={addForm.description || ''} 
                  onChange={e => setAddForm({ ...addForm, description: e.target.value })} 
                  placeholder="Short internal description..."
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Status</label>
              <select 
                value={addForm.isActive ? 'active' : 'disabled'}
                onChange={e => setAddForm({ ...addForm, isActive: e.target.value === 'active' })}
                className="w-full h-10 px-3 rounded-lg border border-input text-xs bg-background"
              >
                <option value="active">Active / Published</option>
                <option value="disabled">Disabled / Archived</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button 
              size="sm" 
              onClick={() => {
                if (activeTab === 'fabrics') handleAddFabric();
                else if (activeTab === 'colors') handleAddColor();
                else if (activeTab === 'fits') handleAddFit();
                else if (activeTab === 'lengths') handleAddLength();
                else if (activeTab === 'sizes') handleAddSize();
              }} 
              className="uppercase tracking-[1px] font-bold"
            >
              Save {activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>
      )}

      {/* TABULAR MASTER LIST */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-[0.5px]">
              <tr>
                {activeTab === 'colors' && <th className="px-4 py-3">Color Preview</th>}
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">{activeTab === 'colors' ? 'Codes (Hex / RGB)' : 'Description'}</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* FABRICS LIST */}
              {activeTab === 'fabrics' && (
                filteredFabrics.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No fabrics found.</td></tr>
                ) : (
                  filteredFabrics.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      {editingId === item.id ? (
                        <td colSpan={4} className="p-4 bg-muted/10">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Fabric Name" />
                            <Input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                            <select 
                              value={editForm.isActive ? 'active' : 'disabled'} 
                              onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                              className="h-10 px-3 rounded-lg border border-input text-xs bg-background"
                            >
                              <option value="active">Active</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end mt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleUpdateFabric(item.id)} className="uppercase tracking-[1px] font-bold">Save</Button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-bold text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-normal">{item.description || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                              {item.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteFabric(item)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              )}

              {/* COLORS LIST */}
              {activeTab === 'colors' && (
                filteredColors.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No colors found.</td></tr>
                ) : (
                  filteredColors.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      {editingId === item.id ? (
                        <td colSpan={5} className="p-4 bg-muted/10">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Color Name" />
                            <div className="flex gap-2 items-center">
                              <input 
                                type="color" 
                                value={editForm.hexCode || '#000000'}
                                onChange={e => setEditForm({ ...editForm, hexCode: e.target.value })}
                                className="w-8 h-8 rounded border p-0 bg-transparent"
                              />
                              <Input value={editForm.hexCode} onChange={e => setEditForm({ ...editForm, hexCode: e.target.value })} placeholder="Hex" />
                            </div>
                            <Input value={editForm.rgb} onChange={e => setEditForm({ ...editForm, rgb: e.target.value })} placeholder="RGB" />
                            <select 
                              value={editForm.isActive ? 'active' : 'disabled'} 
                              onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                              className="h-10 px-3 rounded-lg border border-input text-xs bg-background"
                            >
                              <option value="active">Active</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end mt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleUpdateColor(item.id)} className="uppercase tracking-[1px] font-bold">Save</Button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <div className="w-7 h-7 rounded-full border border-border shadow-sm flex items-center justify-center" style={{ backgroundColor: item.hexCode }}>
                              {item.hexCode.toUpperCase() === '#FFFFFF' && <div className="w-2 h-2 bg-neutral-300 rounded-full" />}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{item.hexCode} | RGB({item.rgb})</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                              {item.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteColor(item)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              )}

              {/* FITS LIST */}
              {activeTab === 'fits' && (
                filteredFits.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No fits found.</td></tr>
                ) : (
                  filteredFits.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      {editingId === item.id ? (
                        <td colSpan={4} className="p-4 bg-muted/10">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Fit Name" />
                            <Input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                            <select 
                              value={editForm.isActive ? 'active' : 'disabled'} 
                              onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                              className="h-10 px-3 rounded-lg border border-input text-xs bg-background"
                            >
                              <option value="active">Active</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end mt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleUpdateFit(item.id)} className="uppercase tracking-[1px] font-bold">Save</Button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-bold text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-normal">{item.description || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                              {item.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteFit(item)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              )}

              {/* LENGTHS LIST */}
              {activeTab === 'lengths' && (
                filteredLengths.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No lengths found.</td></tr>
                ) : (
                  filteredLengths.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      {editingId === item.id ? (
                        <td colSpan={4} className="p-4 bg-muted/10">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Length Name" />
                            <Input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                            <select 
                              value={editForm.isActive ? 'active' : 'disabled'} 
                              onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                              className="h-10 px-3 rounded-lg border border-input text-xs bg-background"
                            >
                              <option value="active">Active</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end mt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleUpdateLength(item.id)} className="uppercase tracking-[1px] font-bold">Save</Button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-bold text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground font-normal">{item.description || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                              {item.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteLength(item)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              )}

              {/* SIZES LIST */}
              {activeTab === 'sizes' && (
                filteredSizes.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No sizes found.</td></tr>
                ) : (
                  filteredSizes.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      {editingId === item.id ? (
                        <td colSpan={4} className="p-4 bg-muted/10">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Size Name (e.g. M, 2XL)" />
                            <Input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                            <select 
                              value={editForm.isActive ? 'active' : 'disabled'} 
                              onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                              className="h-10 px-3 rounded-lg border border-input text-xs bg-background"
                            >
                              <option value="active">Active</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end mt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleUpdateSize(item.id)} className="uppercase tracking-[1px] font-bold">Save</Button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-bold text-foreground">
                            <span className="px-2.5 py-1 bg-muted border border-border rounded text-xs font-mono font-bold">
                              {item.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-normal">{item.description || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                              {item.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteSize(item)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteMasterItem}
        title={`Delete ${itemToDelete?.type.slice(0, -1) || 'Item'}?`}
        description={`Are you sure you want to delete ${itemToDelete?.type.slice(0, -1) || 'item'} "${itemToDelete?.item.name || ''}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
