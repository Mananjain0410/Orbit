import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { defaultSettings, AppSettings } from '../../services/settingsService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Save, Eye, RotateCcw, XCircle, ArrowRight, Layout, Info, Upload, Building, Image, Type, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { uploadService } from '../../services/uploadService';
import { auditLogService } from '../../services/auditLogService';

export function AdminContent() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'header_branding' | 'footer_branding' | 'hero' | 'about' | 'business_profile_link' | 'promotions_link'>('header_branding');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);
  const [isUploadingHeaderImg, setIsUploadingHeaderImg] = useState(false);
  const [isUploadingBrandLogo1, setIsUploadingBrandLogo1] = useState(false);
  const [isUploadingBrandLogo2, setIsUploadingBrandLogo2] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file.', 'error');
      return;
    }

    setIsUploadingAboutImg(true);
    showToast('Uploading About section image to Storage...', 'info');

    try {
      const url = await uploadService.uploadImage(file, 'cms');
      handleStoreInfoChange('aboutImage', url);
      showToast('About image uploaded successfully!', 'success');
    } catch (err) {
      console.error('About image upload failed:', err);
      showToast('About image upload failed.', 'error');
    } finally {
      setIsUploadingAboutImg(false);
    }
  };

  const handleHeaderTypeChange = (type: 'text' | 'image') => {
    setFormData(prev => ({
      ...prev,
      headerBranding: {
        type,
        text: prev.headerBranding?.text || 'Shree Nakoda Fashion',
        imageUrl: prev.headerBranding?.imageUrl || '',
      }
    }));
  };

  const handleHeaderTextChange = (text: string) => {
    setFormData(prev => ({
      ...prev,
      headerBranding: {
        type: prev.headerBranding?.type || 'text',
        text,
        imageUrl: prev.headerBranding?.imageUrl || '',
      }
    }));
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file.', 'error');
      return;
    }

    setIsUploadingHeaderImg(true);
    showToast('Uploading Header Logo to Storage...', 'info');

    try {
      const url = await uploadService.uploadImage(file, 'logo');
      setFormData(prev => ({
        ...prev,
        headerBranding: {
          type: prev.headerBranding?.type || 'text',
          text: prev.headerBranding?.text || 'Shree Nakoda Fashion',
          imageUrl: url,
        }
      }));
      showToast('Header logo uploaded successfully!', 'success');
    } catch (err) {
      console.error('Header logo upload failed:', err);
      showToast('Header logo upload failed.', 'error');
    } finally {
      setIsUploadingHeaderImg(false);
    }
  };

  const handleRemoveHeaderImage = () => {
    setFormData(prev => ({
      ...prev,
      headerBranding: {
        type: prev.headerBranding?.type || 'text',
        text: prev.headerBranding?.text || 'Shree Nakoda Fashion',
        imageUrl: '',
      }
    }));
    showToast('Header logo removed.', 'info');
  };

  const handleBrandLogoUpload = async (fileKey: 'brandLogo1Url' | 'brandLogo2Url', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file.', 'error');
      return;
    }

    if (fileKey === 'brandLogo1Url') setIsUploadingBrandLogo1(true);
    else setIsUploadingBrandLogo2(true);

    showToast('Uploading Brand Logo to Storage...', 'info');

    try {
      const url = await uploadService.uploadImage(file, 'logo');
      setFormData(prev => ({
        ...prev,
        footerBranding: {
          ...prev.footerBranding,
          [fileKey]: url,
        }
      }));
      showToast('Brand logo uploaded successfully!', 'success');
    } catch (err) {
      console.error('Brand logo upload failed:', err);
      showToast('Brand logo upload failed.', 'error');
    } finally {
      if (fileKey === 'brandLogo1Url') setIsUploadingBrandLogo1(false);
      else setIsUploadingBrandLogo2(false);
    }
  };

  const handleRemoveBrandLogo = (fileKey: 'brandLogo1Url' | 'brandLogo2Url') => {
    setFormData(prev => ({
      ...prev,
      footerBranding: {
        ...prev.footerBranding,
        [fileKey]: '',
      }
    }));
    showToast('Brand logo removed.', 'info');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      await auditLogService.logAction('homepage_edited', 'Updated Homepage Content CMS', 'system/settings', settings, formData);
      showToast('Website Content CMS settings saved to Firestore successfully!', 'success');
    } catch (e) {
      console.error('Failed to save settings', e);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings);
    showToast('Unsaved changes reverted to active settings.', 'info');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset website content settings to initial system defaults? You can save after reviewing.')) {
      setFormData(defaultSettings);
      showToast('Settings reset to system defaults in form. Click Save Changes to commit.', 'info');
    }
  };

  const handleHeroChange = (field: keyof AppSettings['homepage'], value: any) => {
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        [field]: value
      }
    }));
  };

  const handleStoreInfoChange = (field: keyof AppSettings['storeInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      storeInfo: {
        ...prev.storeInfo,
        [field]: value
      }
    }));
  };

  const currentHeaderText = formData.headerBranding?.text || 'Shree Nakoda Fashion';
  const currentHeaderType = formData.headerBranding?.type || 'text';
  const currentHeaderImage = formData.headerBranding?.imageUrl || '';
  const currentBrandLogo1 = formData.footerBranding?.brandLogo1Url || '';
  const currentBrandLogo2 = formData.footerBranding?.brandLogo2Url || '';

  return (
    <div className="p-6 md:p-8 max-w-[1700px] mx-auto min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Website Content CMS</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage header branding, footer brand logos, hero title, and homepage content across retailer views.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            {showLivePreview ? 'Hide Preview' : 'Show Live Preview'}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800"
          >
            <XCircle className="w-4 h-4" />
            Cancel Changes
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </Button>

          <Button 
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[1px] px-5"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('header_branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'header_branding' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Type className="w-4 h-4" /> Header Branding
        </button>
        <button
          onClick={() => setActiveTab('footer_branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'footer_branding' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Image className="w-4 h-4 text-blue-600" /> Footer Brand Logos
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'hero' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layout className="w-4 h-4" /> Hero Text & Callout
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'about' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Info className="w-4 h-4" /> About Section CMS
        </button>
        <button
          onClick={() => setActiveTab('business_profile_link')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'business_profile_link' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-600" /> Business Identity & Contact Info
        </button>
        <button
          onClick={() => setActiveTab('promotions_link')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'promotions_link' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Image className="w-4 h-4 text-indigo-600" /> Promotional Banners Manager
        </button>
      </div>

      {/* Content Layout Grid */}
      <div className={`grid grid-cols-1 ${showLivePreview ? 'lg:grid-cols-12' : ''} gap-8 flex-1`}>
        {/* Editor Column */}
        <div className={`${showLivePreview ? 'lg:col-span-6' : 'max-w-4xl'} space-y-6 overflow-y-auto pr-2`}>
          {activeTab === 'header_branding' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-1">Header Branding Configuration</h3>
                <p className="text-xs text-muted-foreground">Configure whether the retail website header displays text or an uploaded image logo.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-2">Header Type</label>
                <select 
                  className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                  value={currentHeaderType}
                  onChange={(e) => handleHeaderTypeChange(e.target.value as 'text' | 'image')}
                >
                  <option value="text">Text Logo (Default)</option>
                  <option value="image">Image Logo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-2">Header Text</label>
                <Input 
                  value={currentHeaderText} 
                  onChange={(e) => handleHeaderTextChange(e.target.value)} 
                  placeholder="Shree Nakoda Fashion"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Displayed when Header Type is set to Text, or as image fallback.</p>
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-2">Header Image Logo</label>
                {currentHeaderImage ? (
                  <div className="mb-4 p-4 border border-border rounded-lg bg-card flex items-center justify-between gap-4">
                    <img src={currentHeaderImage} alt="Header Logo Preview" className="h-10 max-w-[200px] object-contain" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRemoveHeaderImage}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">No header image uploaded. Upload an image logo below to use with Image Logo mode.</p>
                )}

                <label className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-2.5 px-4 rounded-md inline-flex items-center gap-2 font-bold uppercase tracking-[1px] transition-colors">
                  <Upload className="w-4 h-4" /> 
                  {isUploadingHeaderImg ? 'Uploading...' : 'Upload Header Image'}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                    onChange={handleHeaderImageUpload} 
                    disabled={isUploadingHeaderImg}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'footer_branding' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-1">Footer Brand Logos</h3>
                <p className="text-xs text-muted-foreground">Upload Pool Club and KNC brand logos to feature prominently above the company description in the website footer.</p>
              </div>

              {/* Brand Logo 1 (Pool Club) */}
              <div className="border border-border p-5 rounded-lg space-y-4 bg-card/50">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-[1px]">Brand Logo 1 (Pool Club)</h4>
                  {currentBrandLogo1 && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Active</span>}
                </div>

                {currentBrandLogo1 ? (
                  <div className="p-4 border border-border rounded bg-background flex items-center justify-between gap-4">
                    <img src={currentBrandLogo1} alt="Brand Logo 1" className="max-h-[50px] max-w-[180px] object-contain" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveBrandLogo('brandLogo1Url')}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No logo uploaded for Brand 1.</p>
                )}

                <label className="cursor-pointer bg-muted hover:bg-muted/80 text-foreground text-xs py-2 px-4 rounded border border-border inline-flex items-center gap-2 font-bold uppercase tracking-[1px] transition-colors">
                  <Upload className="w-4 h-4" /> 
                  {isUploadingBrandLogo1 ? 'Uploading...' : 'Upload Brand Logo 1'}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                    onChange={(e) => handleBrandLogoUpload('brandLogo1Url', e)} 
                    disabled={isUploadingBrandLogo1}
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Brand Logo 2 (KNC) */}
              <div className="border border-border p-5 rounded-lg space-y-4 bg-card/50">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-[1px]">Brand Logo 2 (KNC)</h4>
                  {currentBrandLogo2 && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Active</span>}
                </div>

                {currentBrandLogo2 ? (
                  <div className="p-4 border border-border rounded bg-background flex items-center justify-between gap-4">
                    <img src={currentBrandLogo2} alt="Brand Logo 2" className="max-h-[50px] max-w-[180px] object-contain" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveBrandLogo('brandLogo2Url')}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No logo uploaded for Brand 2.</p>
                )}

                <label className="cursor-pointer bg-muted hover:bg-muted/80 text-foreground text-xs py-2 px-4 rounded border border-border inline-flex items-center gap-2 font-bold uppercase tracking-[1px] transition-colors">
                  <Upload className="w-4 h-4" /> 
                  {isUploadingBrandLogo2 ? 'Uploading...' : 'Upload Brand Logo 2'}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                    onChange={(e) => handleBrandLogoUpload('brandLogo2Url', e)} 
                    disabled={isUploadingBrandLogo2}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Hero Section Content</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Hero Title</label>
                <Input 
                  value={formData.homepage?.heroTitle || ''} 
                  onChange={(e) => handleHeroChange('heroTitle', e.target.value)} 
                  placeholder="E.g. Premium Wholesale Garments"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Hero Subtitle</label>
                <textarea 
                  className="w-full min-h-[90px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.homepage?.heroSubtitle || ''} 
                  onChange={(e) => handleHeroChange('heroSubtitle', e.target.value)} 
                  placeholder="Uncompromising quality designed for modern retail..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Hero Button Callout Text</label>
                <Input 
                  value={formData.homepage?.heroButtonText || ''} 
                  onChange={(e) => handleHeroChange('heroButtonText', e.target.value)} 
                  placeholder="E.g. Explore Collection"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Hero Main Feature Background Image URL</label>
                <Input 
                  value={formData.homepage?.heroImage || ''} 
                  onChange={(e) => handleHeroChange('heroImage', e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Homepage About Section CMS</h3>
              <p className="text-xs text-muted-foreground">Manage the "About Manufacturer" section displayed on the retailer homepage.</p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Eyebrow Title</label>
                <Input 
                  value={formData.storeInfo?.aboutTitle || ''} 
                  onChange={(e) => handleStoreInfoChange('aboutTitle', e.target.value)} 
                  placeholder="E.g. About MNFR."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Main Heading</label>
                <textarea 
                  className="w-full min-h-[80px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.storeInfo?.aboutHeading || ''} 
                  onChange={(e) => handleStoreInfoChange('aboutHeading', e.target.value)} 
                  placeholder="Crafting comfort wear with exceptional attention to detail since 2010."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Paragraph Description</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.storeInfo?.aboutParagraph || ''} 
                  onChange={(e) => handleStoreInfoChange('aboutParagraph', e.target.value)} 
                  placeholder="We are a dedicated B2B manufacturing partner serving over 1,000 retailers..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Button Text</label>
                  <Input 
                    value={formData.storeInfo?.aboutButtonText || ''} 
                    onChange={(e) => handleStoreInfoChange('aboutButtonText', e.target.value)} 
                    placeholder="E.g. Explore Retailer Catalog"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Button Target Link</label>
                  <Input 
                    value={formData.storeInfo?.aboutButtonLink || ''} 
                    onChange={(e) => handleStoreInfoChange('aboutButtonLink', e.target.value)} 
                    placeholder="E.g. /category/lowers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-2">Optional About Image</label>
                {formData.storeInfo?.aboutImage && (
                  <div className="mb-3 max-w-md aspect-video rounded overflow-hidden border relative group">
                    <img src={formData.storeInfo.aboutImage} alt="About Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleStoreInfoChange('aboutImage', '')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <label className="cursor-pointer bg-muted hover:bg-muted/80 text-xs py-2 px-4 rounded border border-border inline-flex items-center gap-2 font-bold uppercase tracking-[1px]">
                  <Upload className="w-4 h-4" /> 
                  {isUploadingAboutImg ? 'Uploading...' : 'Upload Image to Storage'}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    onChange={handleAboutImageUpload} 
                    disabled={isUploadingAboutImg}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'business_profile_link' && (
            <div className="bg-emerald-50/50 border border-emerald-200 p-8 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-emerald-800">
                <Building className="w-6 h-6" />
                <h3 className="text-lg font-bold">Single Source of Truth: Business Profile</h3>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Logos, Firm Name, GSTIN, Address, Contact details (Phone, Email, Support, WhatsApp), Social Media links, and Footer Copyright are centrally managed in the <strong>Business Profile</strong> module to prevent duplicate data editing.
              </p>
              <Link 
                to="/admin/business-profile" 
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-[1px] px-6 py-3 rounded-lg transition-colors"
              >
                Go to Business Profile Manager <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {activeTab === 'promotions_link' && (
            <div className="bg-indigo-50/50 border border-indigo-200 p-8 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-indigo-800">
                <Image className="w-6 h-6" />
                <h3 className="text-lg font-bold">Single Source of Truth: Promotional Media</h3>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                Hero carousel slides, promo campaign cards, and featured grid banners are centrally managed in the <strong>Promotional Media</strong> module.
              </p>
              <Link 
                to="/admin/promotions" 
                className="inline-flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-bold uppercase tracking-[1px] px-6 py-3 rounded-lg transition-colors"
              >
                Go to Promotional Media Manager <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {showLivePreview && (
          <div className="lg:col-span-6 border border-border rounded-lg bg-neutral-900 text-white overflow-hidden flex flex-col h-[750px] sticky top-24 shadow-2xl">
            <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-neutral-400 ml-2 font-sans font-medium text-[11px] uppercase tracking-[1px]">Live Preview (Unsaved State)</span>
              </div>
              <span className="text-neutral-400 text-[10px] bg-neutral-700/60 px-2 py-0.5 rounded">Real-time Sync</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-background text-foreground text-left p-0 select-none">
              {/* Header Bar Mockup */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentHeaderType === 'image' && currentHeaderImage ? (
                    <img src={currentHeaderImage} alt={currentHeaderText} className="h-8 max-w-[180px] object-contain" />
                  ) : (
                    <span className="font-bold text-lg tracking-tight text-foreground">{currentHeaderText}</span>
                  )}
                </div>
                <div className="flex gap-4 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  <span>Categories</span>
                  <span>New Arrivals</span>
                  <span>Cart (0)</span>
                </div>
              </div>

              {/* Hero Banner Preview */}
              <div className="relative h-64 w-full bg-foreground text-white flex items-center justify-start p-8 overflow-hidden">
                <img 
                  src={formData.homepage?.heroImage || defaultSettings.homepage.heroImage} 
                  alt="Preview Hero" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
                <div className="relative z-10 max-w-lg">
                  <span className="text-[9px] uppercase tracking-[3px] text-white/80 block mb-1">{currentHeaderText}</span>
                  <h1 className="font-serif text-2xl font-light mb-2 leading-tight">{formData.homepage?.heroTitle || 'Hero Title Placeholder'}</h1>
                  <p className="text-xs text-white/80 font-light leading-relaxed mb-4">{formData.homepage?.heroSubtitle || 'Hero Subtitle Placeholder'}</p>
                  <button className="bg-white text-foreground px-5 py-2 text-[10px] uppercase tracking-[1px] font-bold">
                    {formData.homepage?.heroButtonText || 'Explore Collection'}
                  </button>
                </div>
              </div>

              {/* Footer Preview Mockup */}
              <div className="p-6 bg-card border-t border-border mt-8">
                <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground block mb-3 font-bold">Footer Preview</span>
                <div className="p-4 border border-border rounded bg-background space-y-4">
                  {(currentBrandLogo1 || currentBrandLogo2) && (
                    <div className="flex flex-wrap items-center gap-6 border-b border-border pb-3">
                      {currentBrandLogo1 && (
                        <img src={currentBrandLogo1} alt="Pool Club Logo" className="max-h-[40px] max-w-[140px] object-contain" />
                      )}
                      {currentBrandLogo2 && (
                        <img src={currentBrandLogo2} alt="KNC Logo" className="max-h-[40px] max-w-[140px] object-contain" />
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Shree Nakoda Fashion — Leading manufacturer and wholesaler of premium apparel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
