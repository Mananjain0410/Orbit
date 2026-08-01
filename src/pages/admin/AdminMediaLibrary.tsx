import React, { useState, useEffect, useRef } from 'react';
import { Upload, Search, Image as ImageIcon, Link as LinkIcon, Trash, Grid, List as ListIcon, RefreshCw, Eye, X, Check } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { mediaService, MediaItem } from '../../services/mediaService';
import { uploadService } from '../../services/uploadService';

export function AdminMediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = mediaService.subscribeToMedia((items) => {
      setMediaItems(items);
    });
    return () => unsubscribe();
  }, []);

  const filteredMedia = mediaItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    showToast('Image URL copied to clipboard!', 'success');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    showToast('Uploading media to Firebase Storage...', 'info');

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = uploadService.validateImageFile(file);
      if (!validation.valid) {
        showToast(validation.error || 'Invalid file format.', 'error');
        continue;
      }

      try {
        await mediaService.uploadMedia(file, 'media');
        successCount++;
      } catch (err) {
        console.error('Failed uploading file:', file.name, err);
        showToast(`Failed to upload ${file.name}. Please try again.`, 'error');
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      showToast(`Successfully uploaded ${successCount} media item(s).`, 'success');
    }
  };

  const handleTriggerReplace = (item: MediaItem) => {
    setReplacingId(item.id);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const itemToReplace = mediaItems.find(m => m.id === replacingId);
    if (!itemToReplace) return;

    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid file format.', 'error');
      return;
    }

    setIsUploading(true);
    showToast('Replacing image in Storage & Firestore...', 'info');

    try {
      await mediaService.replaceMedia(itemToReplace.id, itemToReplace.url, file);
      showToast('Media image replaced successfully!', 'success');
    } catch (err) {
      console.error('Failed replacing media:', err);
      showToast('Image replacement failed. Kept previous image.', 'error');
    } finally {
      setIsUploading(false);
      setReplacingId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from Storage and database?`)) {
      return;
    }

    try {
      await mediaService.deleteMedia(item.id, item.url, item.name);
      showToast('Media deleted successfully.', 'success');
      if (previewMedia?.id === item.id) {
        setPreviewMedia(null);
      }
    } catch (err) {
      console.error('Failed deleting media:', err);
      showToast('Failed to delete media from storage.', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col space-y-6">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/png, image/jpeg, image/jpg, image/webp" 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={replaceInputRef} 
        onChange={handleReplaceFile} 
        accept="image/png, image/jpeg, image/jpg, image/webp" 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload, replace, preview, and manage images (PNG, JPG, JPEG, WEBP) stored in Firebase Storage.</p>
        </div>
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading} 
          className="flex items-center gap-2 font-bold uppercase tracking-[1px] px-5"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload Media'}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search files by name..." 
            className="pl-10 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-input rounded-md overflow-hidden h-10 bg-background">
            <button 
              className={`px-3.5 flex items-center gap-1 text-xs font-semibold ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" /> Grid
            </button>
            <button 
              className={`px-3.5 flex items-center gap-1 text-xs font-semibold border-l border-input ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid / List */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-card border border-border rounded-lg p-6">
        {filteredMedia.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-medium text-base text-foreground mb-1">No media files found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              {searchQuery ? 'No files match your search query.' : 'Upload PNG, JPG, JPEG, or WEBP images to store them securely in Firebase Storage.'}
            </p>
            <Button size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs uppercase tracking-[1px]">
              <Upload className="w-4 h-4 mr-1.5" /> Upload First Image
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group border border-border rounded-lg overflow-hidden bg-background flex flex-col justify-between hover:shadow-md transition-all">
                <div className="aspect-square relative bg-muted/40 flex items-center justify-center overflow-hidden">
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[2px] p-2">
                    <button 
                      onClick={() => setPreviewMedia(item)} 
                      title="Preview Image"
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleCopyLink(item.url)} 
                      title="Copy Image URL"
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleTriggerReplace(item)} 
                      title="Replace Image File"
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item)} 
                      title="Delete File"
                      className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-background border-t border-border">
                  <div className="font-medium text-xs truncate text-foreground" title={item.name}>{item.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                    <span>{item.size || 'Image'}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-bold tracking-[0.5px]">
                <tr>
                  <th className="px-4 py-3">Image Preview</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center border border-border">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground truncate max-w-[220px]" title={item.name}>{item.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.size}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setPreviewMedia(item)} title="Preview Image">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleCopyLink(item.url)} title="Copy URL">
                          <LinkIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleTriggerReplace(item)} title="Replace File">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(item)} title="Delete">
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 relative overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-sm truncate pr-4">{previewMedia.name}</h3>
              <button onClick={() => setPreviewMedia(null)} className="p-1 hover:bg-muted rounded text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] bg-black/90 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img src={previewMedia.url} alt={previewMedia.name} className="max-h-[55vh] object-contain rounded" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs text-muted-foreground border-t border-border">
              <div>
                <span>Size: <strong className="text-foreground">{previewMedia.size}</strong></span>
                <span className="mx-2">•</span>
                <span>Uploaded: <strong className="text-foreground">{new Date(previewMedia.createdAt).toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button size="sm" variant="outline" onClick={() => handleCopyLink(previewMedia.url)} className="flex-1 sm:flex-initial text-xs gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Copy Image URL
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(previewMedia)} className="text-xs">
                  <Trash className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
