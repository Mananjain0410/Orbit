import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, Save, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../components/ui/Toast';
import { uploadService } from '../../services/uploadService';
import { auditLogService } from '../../services/auditLogService';

export function AdminPromotions() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  const heroImages = settings.homepage?.heroImages || [];
  const promoBanners = settings.homepage?.promoBanners || [];

  const [localHeroImages, setLocalHeroImages] = useState<string[]>(heroImages);
  const [localBanners, setLocalBanners] = useState(promoBanners);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  React.useEffect(() => {
    setLocalHeroImages(settings.homepage?.heroImages || []);
    setLocalBanners(settings.homepage?.promoBanners || []);
  }, [settings]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        homepage: {
          ...settings.homepage,
          heroImages: localHeroImages,
          promoBanners: localBanners,
        }
      };

      await updateSettings(updatedSettings);

      // Clean up old replaced/deleted Storage files after successful save
      for (const oldUrl of pendingDeletions) {
        await uploadService.deleteImage(oldUrl);
      }
      setPendingDeletions([]);

      await auditLogService.logAction(
        'banner_updated',
        'Updated promotional hero carousels & feature banners',
        'system/settings',
        null,
        { heroImages: localHeroImages, promoBanners: localBanners }
      );

      showToast('Promotional media updated and saved to Firestore!', 'success');
    } catch (err) {
      console.error('Failed to save promotional media:', err);
      showToast('Save failed. Unable to save promotional media.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Hero carousel image file upload handler
  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid image file.', 'error');
      return;
    }

    setIsUploadingHero(true);
    showToast('Uploading hero image to Firebase Storage...', 'info');

    try {
      const downloadUrl = await uploadService.uploadImage(file, 'promotions');
      setLocalHeroImages(prev => [...prev, downloadUrl]);
      showToast('Hero carousel image uploaded and added!', 'success');
    } catch (err) {
      console.error('Hero image upload failed:', err);
      showToast('Image upload failed. Previous hero carousel preserved.', 'error');
    } finally {
      setIsUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleRemoveHeroImage = (index: number) => {
    const targetUrl = localHeroImages[index];
    if (targetUrl) {
      setPendingDeletions(prev => [...prev, targetUrl]);
    }
    setLocalHeroImages(prev => prev.filter((_, i) => i !== index));
    showToast('Hero slide removed. Click Save to finalize.', 'info');
  };

  const handleMoveHeroImage = (index: number, direction: 'up' | 'down') => {
    setLocalHeroImages(prev => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Promo Banner handlers
  const handleAddBanner = () => {
    setLocalBanners(prev => [
      ...prev,
      {
        id: `banner_${Date.now()}`,
        title: 'New Featured Collection',
        subtitle: 'High sell-through designs direct from factory',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000',
        link: '/category/lowers'
      }
    ]);
  };

  const handleRemoveBanner = (id: string) => {
    const bannerToRemove = localBanners.find(b => b.id === id);
    if (bannerToRemove?.image) {
      setPendingDeletions(prev => [...prev, bannerToRemove.image]);
    }
    setLocalBanners(prev => prev.filter(b => b.id !== id));
    showToast('Banner card removed. Click Save to commit.', 'info');
  };

  const handleBannerFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid image file.', 'error');
      return;
    }

    const previousUrl = localBanners[index]?.image;

    setUploadingIndex(index);
    showToast('Uploading banner replacement to Storage...', 'info');

    try {
      const newUrl = await uploadService.uploadImage(file, 'promotions');

      // Update banner image URL in local state
      setLocalBanners(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], image: newUrl };
        }
        return next;
      });

      // Mark old image for deletion upon save
      if (previousUrl && previousUrl !== newUrl) {
        setPendingDeletions(prev => [...prev, previousUrl]);
      }

      showToast('Banner image replaced successfully!', 'success');
    } catch (err) {
      console.error('Banner image upload failed:', err);
      showToast('Image upload failed. Kept previous image.', 'error');
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Promotional Media Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage homepage banner carousels, promo grid media, and promotional sections in real time.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving} className="flex items-center gap-2 font-bold uppercase tracking-[1px] px-6">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save All Media Changes'}
        </Button>
      </div>

      {/* 1. Hero Carousel Images */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Hero Banner Carousel Images</h2>
            <p className="text-xs text-muted-foreground">Images rotate automatically every 5 seconds on the homepage hero banner.</p>
          </div>
          <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-[1px] rounded inline-flex items-center gap-2 hover:bg-primary/90">
            <Upload className="w-4 h-4" /> {isUploadingHero ? 'Uploading...' : 'Add Hero Image'}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={handleHeroFileUpload} 
              disabled={isUploadingHero}
              className="hidden" 
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {localHeroImages.map((imgUrl, index) => (
            <div key={index} className="relative group border border-border rounded-lg overflow-hidden bg-muted/40 p-2 flex flex-col justify-between space-y-2">
              <div className="aspect-video w-full overflow-hidden rounded bg-black">
                <img src={imgUrl} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between text-xs font-medium px-1">
                <span>Slide #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleMoveHeroImage(index, 'up')} 
                    disabled={index === 0}
                    className="p-1 hover:bg-muted rounded disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleMoveHeroImage(index, 'down')} 
                    disabled={index === localHeroImages.length - 1}
                    className="p-1 hover:bg-muted rounded disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleRemoveHeroImage(index)} 
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Remove Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Promotional Banners */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Homepage Feature Banners</h2>
            <p className="text-xs text-muted-foreground">Main grid promotional cards displayed below the hero carousel.</p>
          </div>
          <Button onClick={handleAddBanner} size="sm" className="flex items-center gap-2 text-xs font-bold uppercase">
            <Plus className="w-4 h-4" /> Add Promo Card
          </Button>
        </div>

        <div className="space-y-6">
          {localBanners.map((banner, index) => (
            <div key={banner.id || index} className="p-4 border border-border rounded-lg bg-background space-y-4 relative">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-[1px] text-muted-foreground">Banner Card #{index + 1}</span>
                <button 
                  onClick={() => handleRemoveBanner(banner.id)} 
                  className="text-red-600 hover:bg-red-50 p-1 rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 relative group aspect-video bg-muted rounded overflow-hidden border">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-xs font-bold uppercase tracking-[1px] p-2 text-center">
                    <Upload className="w-4 h-4 mr-1.5" /> {uploadingIndex === index ? 'Uploading...' : 'Replace Image'}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      onChange={(e) => handleBannerFileUpload(index, e)} 
                      disabled={uploadingIndex === index}
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground mb-1">Banner Title</label>
                    <Input 
                      value={banner.title} 
                      onChange={(e) => {
                        const updated = [...localBanners];
                        updated[index].title = e.target.value;
                        setLocalBanners(updated);
                      }} 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground mb-1">Subtitle</label>
                    <Input 
                      value={banner.subtitle} 
                      onChange={(e) => {
                        const updated = [...localBanners];
                        updated[index].subtitle = e.target.value;
                        setLocalBanners(updated);
                      }} 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground mb-1">Link Target</label>
                    <Input 
                      value={banner.link} 
                      onChange={(e) => {
                        const updated = [...localBanners];
                        updated[index].link = e.target.value;
                        setLocalBanners(updated);
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
