import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { defaultSettings, AppSettings, PromoBanner } from '../../services/settingsService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Save, Eye, RotateCcw, XCircle, Plus, Trash2, ArrowRight, Phone, Mail, MessageCircle, MapPin, Instagram, Facebook, Globe, Layout, Image, Info, Upload } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { auditLogService } from '../../services/auditLogService';

export function AdminContent() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'about' | 'banners' | 'footer' | 'contact' | 'social'>('logo');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo image must be under 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleStoreInfoChange('logoUrl', dataUrl);
        showToast('Logo image uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      await auditLogService.logAction('homepage_edited', 'Updated Homepage CMS & Brand Settings', 'system/settings', settings, formData);
      showToast('Homepage CMS settings saved to Firestore successfully!', 'success');
    } catch (e) {
      console.error('Failed to save homepage settings', e);
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
    if (window.confirm('Are you sure you want to reset homepage settings to initial system defaults? You can save after reviewing.')) {
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

  const handleContactChange = (field: keyof AppSettings['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleSocialChange = (field: keyof AppSettings['social'], value: string) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value
      }
    }));
  };

  const handleBannerChange = (index: number, field: keyof PromoBanner, value: string) => {
    setFormData(prev => {
      const updatedBanners = [...(prev.homepage.promoBanners || [])];
      updatedBanners[index] = { ...updatedBanners[index], [field]: value };
      return {
        ...prev,
        homepage: {
          ...prev.homepage,
          promoBanners: updatedBanners
        }
      };
    });
  };

  const handleAddBanner = () => {
    const newBanner: PromoBanner = {
      id: Date.now().toString(),
      title: 'New Season Special',
      subtitle: 'Exclusive wholesale collection for premium retailers',
      image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=1000',
      link: '/category/lowers'
    };
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        promoBanners: [...(prev.homepage.promoBanners || []), newBanner]
      }
    }));
  };

  const handleRemoveBanner = (id: string) => {
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        promoBanners: (prev.homepage.promoBanners || []).filter(b => b.id !== id)
      }
    }));
  };

  return (
    <div className="p-6 md:p-8 max-w-[1700px] mx-auto min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Homepage CMS & Layout Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage live hero content, about section, promotional banners, footer, and brand information across all retailer views.</p>
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
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'logo' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Image className="w-4 h-4" /> Logo & Identity
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'hero' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layout className="w-4 h-4" /> Hero Banner
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
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'banners' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Image className="w-4 h-4" /> Promo Banners ({formData.homepage?.promoBanners?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'footer' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="w-4 h-4" /> Footer & Brand
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'contact' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Phone className="w-4 h-4" /> Contact Info
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[1px] border-b-2 transition-all ${
            activeTab === 'social' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Instagram className="w-4 h-4" /> Social Links
        </button>
      </div>

      {/* Content Layout Grid */}
      <div className={`grid grid-cols-1 ${showLivePreview ? 'lg:grid-cols-12' : ''} gap-8 flex-1`}>
        {/* Editor Column */}
        <div className={`${showLivePreview ? 'lg:col-span-6' : 'max-w-4xl'} space-y-6 overflow-y-auto pr-2`}>
          {activeTab === 'logo' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Logo & Brand Identity</h3>

              <div className="p-4 bg-muted/40 border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[1px] text-muted-foreground block mb-1">Current Active Logo</span>
                  {formData.storeInfo.logoUrl ? (
                    <img src={formData.storeInfo.logoUrl} alt="Logo Preview" className="h-12 max-w-[200px] object-contain bg-white p-2 border rounded" />
                  ) : (
                    <div className="text-sm font-serif font-bold tracking-tight text-foreground uppercase border p-2 bg-white rounded">
                      {formData.storeInfo.name || 'MNFR Wholesale'} (Text Fallback)
                    </div>
                  )}
                </div>
                {formData.storeInfo.logoUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleStoreInfoChange('logoUrl', '')}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove Logo (Use Text)
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-2">Upload New Logo (SVG, PNG, JPG)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/20 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/svg+xml, image/png, image/jpeg, image/webp" 
                    onChange={handleLogoFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-semibold text-foreground">Click or Drag & Drop image file to upload</p>
                  <p className="text-[11px] text-muted-foreground mt-1">SVG, PNG, or JPG (Max 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Or Enter Direct Image URL</label>
                <Input 
                  value={formData.storeInfo.logoUrl || ''} 
                  onChange={(e) => handleStoreInfoChange('logoUrl', e.target.value)} 
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Brand Name</label>
                <Input 
                  value={formData.storeInfo.name || ''} 
                  onChange={(e) => handleStoreInfoChange('name', e.target.value)} 
                  placeholder="E.g. MNFR Wholesale"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Brand Tagline</label>
                <Input 
                  value={formData.storeInfo.tagline || ''} 
                  onChange={(e) => handleStoreInfoChange('tagline', e.target.value)} 
                  placeholder="E.g. Premium B2B Apparel"
                />
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Hero Section Configuration</h3>
              
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
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Hero Button Text</label>
                <Input 
                  value={formData.homepage?.heroButtonText || ''} 
                  onChange={(e) => handleHeroChange('heroButtonText', e.target.value)} 
                  placeholder="E.g. Explore Collection"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Hero Main Image URL</label>
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

          {activeTab === 'banners' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center bg-background border border-border p-4 rounded-lg">
                <div>
                  <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent">Promotional Banners</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Feature seasonal offers or high-margin product categories on the homepage.</p>
                </div>
                <Button onClick={handleAddBanner} size="sm" className="flex items-center gap-1.5 text-xs font-bold uppercase">
                  <Plus className="w-4 h-4" /> Add Banner
                </Button>
              </div>

              {(formData.homepage?.promoBanners || []).map((banner, idx) => (
                <div key={banner.id || idx} className="bg-background border border-border p-5 rounded-lg space-y-4 relative group">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-xs font-bold uppercase tracking-[1px] text-muted-foreground">Banner #{idx + 1}</span>
                    <button 
                      onClick={() => handleRemoveBanner(banner.id)} 
                      className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] mb-1">Title</label>
                      <Input 
                        value={banner.title} 
                        onChange={(e) => handleBannerChange(idx, 'title', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] mb-1">Category Link</label>
                      <Input 
                        value={banner.link} 
                        onChange={(e) => handleBannerChange(idx, 'link', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] mb-1">Subtitle</label>
                    <Input 
                      value={banner.subtitle} 
                      onChange={(e) => handleBannerChange(idx, 'subtitle', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] mb-1">Image URL</label>
                    <Input 
                      value={banner.image} 
                      onChange={(e) => handleBannerChange(idx, 'image', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Footer & Brand Profile</h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Store Name</label>
                <Input 
                  value={formData.storeInfo?.name || ''} 
                  onChange={(e) => handleStoreInfoChange('name', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Tagline</label>
                <Input 
                  value={formData.storeInfo?.tagline || ''} 
                  onChange={(e) => handleStoreInfoChange('tagline', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">About Text (Brief Overview)</label>
                <textarea 
                  className="w-full min-h-[90px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.storeInfo?.aboutText || ''} 
                  onChange={(e) => handleStoreInfoChange('aboutText', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Footer Copyright Text</label>
                <Input 
                  value={formData.storeInfo?.footerText || ''} 
                  onChange={(e) => handleStoreInfoChange('footerText', e.target.value)} 
                />
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Contact Details</h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Email Address</label>
                <Input 
                  value={formData.contact?.email || ''} 
                  onChange={(e) => handleContactChange('email', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Phone Number</label>
                <Input 
                  value={formData.contact?.phone || ''} 
                  onChange={(e) => handleContactChange('phone', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">WhatsApp Support Number</label>
                <Input 
                  value={formData.contact?.whatsapp || ''} 
                  onChange={(e) => handleContactChange('whatsapp', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Working Hours</label>
                <Input 
                  value={formData.contact?.workingHours || ''} 
                  onChange={(e) => handleContactChange('workingHours', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Factory & Office Address</label>
                <textarea 
                  className="w-full min-h-[80px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.contact?.address || ''} 
                  onChange={(e) => handleContactChange('address', e.target.value)} 
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-background border border-border p-6 rounded-lg space-y-5 animate-in fade-in duration-200">
              <h3 className="text-sm uppercase tracking-[2px] font-bold text-accent mb-2">Social Media Links</h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Instagram URL</label>
                <Input 
                  value={formData.social?.instagram || ''} 
                  onChange={(e) => handleSocialChange('instagram', e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[1px] mb-1">Facebook URL</label>
                <Input 
                  value={formData.social?.facebook || ''} 
                  onChange={(e) => handleSocialChange('facebook', e.target.value)} 
                />
              </div>
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
              {/* Hero Banner Preview */}
              <div className="relative h-80 w-full bg-foreground text-white flex items-center justify-start p-8 overflow-hidden">
                <img 
                  src={formData.homepage?.heroImage || defaultSettings.homepage.heroImage} 
                  alt="Preview Hero" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
                <div className="relative z-10 max-w-lg">
                  <span className="text-[9px] uppercase tracking-[3px] text-white/80 block mb-2">{formData.storeInfo?.name}</span>
                  <h1 className="font-serif text-3xl font-light mb-3 leading-tight">{formData.homepage?.heroTitle || 'Hero Title Placeholder'}</h1>
                  <p className="text-xs text-white/80 font-light leading-relaxed mb-6">{formData.homepage?.heroSubtitle || 'Hero Subtitle Placeholder'}</p>
                  <button className="bg-white text-foreground px-6 py-2.5 text-[10px] uppercase tracking-[1px] font-bold">
                    {formData.homepage?.heroButtonText || 'Explore Collection'}
                  </button>
                </div>
              </div>

              {/* About Section Preview */}
              <div className="p-8 text-center bg-card border-b border-border">
                <span className="text-[9px] uppercase tracking-[3px] text-muted-foreground block mb-2">
                  {formData.storeInfo?.aboutTitle || 'About MNFR.'}
                </span>
                <h3 className="font-serif text-xl font-bold mb-3">
                  {formData.storeInfo?.aboutHeading || 'Crafting comfort wear with exceptional attention...'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed mb-4">
                  {formData.storeInfo?.aboutParagraph || formData.storeInfo?.aboutText}
                </p>
                {formData.storeInfo?.aboutImage && (
                  <img src={formData.storeInfo.aboutImage} alt="About preview" className="max-w-xs mx-auto rounded border my-3 aspect-video object-cover" />
                )}
                {formData.storeInfo?.aboutButtonText && (
                  <span className="inline-block bg-foreground text-background text-[10px] font-bold uppercase tracking-[1px] px-5 py-2">
                    {formData.storeInfo.aboutButtonText}
                  </span>
                )}
              </div>

              {/* Promo Banners Preview */}
              {(formData.homepage?.promoBanners || []).length > 0 && (
                <div className="p-6 bg-muted/30 border-b border-border">
                  <span className="text-[10px] uppercase tracking-[2px] font-bold text-muted-foreground block mb-4">Promotional Banners</span>
                  <div className="grid grid-cols-1 gap-4">
                    {(formData.homepage?.promoBanners || []).map((banner, bIdx) => (
                      <div key={bIdx} className="relative h-32 bg-foreground text-white p-5 rounded overflow-hidden flex flex-col justify-end">
                        <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                        <div className="relative z-10">
                          <h4 className="font-serif text-base font-bold">{banner.title}</h4>
                          <p className="text-[11px] text-white/80 font-light truncate">{banner.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Preview */}
              <div className="bg-neutral-950 text-white p-8">
                <div className="grid grid-cols-2 gap-6 text-xs mb-6">
                  <div>
                    <span className="font-serif font-bold text-xl block mb-2">{formData.storeInfo?.name}</span>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">{formData.storeInfo?.aboutText}</p>
                  </div>
                  <div className="space-y-1.5 text-neutral-300 text-[11px]">
                    <p className="font-bold uppercase tracking-[1px] text-[10px] text-neutral-500 mb-1">Contact Us</p>
                    <p>Phone: {formData.contact?.phone}</p>
                    <p>Email: {formData.contact?.email}</p>
                    <p>WhatsApp: {formData.contact?.whatsapp}</p>
                    <p className="text-neutral-500 text-[10px] mt-2">{formData.contact?.address}</p>
                  </div>
                </div>
                <div className="border-t border-neutral-800 pt-4 text-[10px] text-neutral-500 text-center">
                  {formData.storeInfo?.footerText}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
