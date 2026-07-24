import { Skeleton } from '../../components/ui/Skeleton';
import React, { useState } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AdminPromotions() {
  const [banners, setBanners] = useState([
    { id: '1', url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000', type: 'image' },
    { id: '2', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000', type: 'image' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Promotional Media</h1>
          <p className="text-muted-foreground">Manage homepage banners, videos, and popup imagery.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Homepage Banners */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Homepage Banners</h2>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Media
            </Button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-muted/10 p-3 rounded-lg border border-border">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="w-32 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : banners.map((banner, index) => (
                <div key={banner.id} className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border group">
                  <div className="cursor-move text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="w-32 h-16 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                    <img src={banner.url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded">
                      {banner.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Banner_{index + 1}.{banner.type === 'image' ? 'jpg' : 'mp4'}</div>
                    <div className="text-xs text-muted-foreground">Order: {index + 1}</div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8">Replace</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-2 border-dashed border-border rounded-lg p-12 text-center flex flex-col items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mb-4" />
              <div className="font-medium mb-1">Drag and drop media here</div>
              <div className="text-sm text-muted-foreground">Supports JPG, PNG, MP4 (Max 10MB)</div>
            </div>
          </div>
        </section>

        {/* Category Banners */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Category Banners</h2>
          </div>
          <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-lg bg-muted/10">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Category Banners</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              You haven't uploaded any banners for specific product categories. These appear at the top of category pages.
            </p>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Category Banner
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
