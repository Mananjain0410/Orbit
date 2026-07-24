import React, { useState } from 'react';
import { Upload, Search, Filter, Image as ImageIcon, Film, MoreHorizontal, Download, Link as LinkIcon, Trash, Grid, List as ListIcon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export function AdminMediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast, success } = useToast();

  const mediaFiles = [
    { id: '1', name: 'hero-banner-summer.jpg', type: 'image', size: '2.4 MB', date: '2026-07-15', url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000' },
    { id: '2', name: 'category-lowers.jpg', type: 'image', size: '1.2 MB', date: '2026-07-14', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800' },
    { id: '3', name: 'product-demo.mp4', type: 'video', size: '14.5 MB', date: '2026-07-10', url: '' },
    { id: '4', name: 'spring-collection.jpg', type: 'image', size: '3.1 MB', date: '2026-07-08', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000' },
  ];

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    success('Link Copied', 'The media URL has been copied to your clipboard.');
  };

  const handleUpload = () => {
    // In a real app this would open a file picker
    toast('Upload Started', 'Processing and compressing media...', 'info');
    setTimeout(() => {
      success('Upload Complete', 'Media has been successfully added to the library.');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Media Library</h1>
          <p className="text-muted-foreground">Manage all images and videos used across your platform.</p>
        </div>
        <Button onClick={handleUpload} className="flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Media
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search files by name..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <select className="h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest Size</option>
            <option value="smallest">Smallest Size</option>
          </select>
          <div className="flex border border-input rounded-md overflow-hidden h-10">
            <button 
              className={`px-3 ${viewMode === 'grid' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              className={`px-3 border-l border-input ${viewMode === 'list' ? 'bg-muted' : 'bg-background hover:bg-muted/50'}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-card border border-border rounded-lg p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaFiles.map((file) => (
              <div key={file.id} className="group border border-border rounded-lg overflow-hidden bg-background">
                <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                  {file.type === 'image' && file.url ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  ) : (
                    <Film className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded text-xs backdrop-blur-sm">
                    {file.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white border-0" onClick={() => handleCopyLink(file.url)}>
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white border-0">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="w-8 h-8 rounded-full border-0">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate" title={file.name}>{file.name}</div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{file.size}</span>
                    <span>{new Date(file.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Upload Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mediaFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                         {file.type === 'image' && file.url ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{file.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{file.size}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(file.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleCopyLink(file.url)} title="Copy Link">
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                          <Trash className="w-4 h-4" />
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
    </div>
  );
}
