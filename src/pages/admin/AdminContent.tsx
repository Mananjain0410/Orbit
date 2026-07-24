import { Skeleton } from '../../components/ui/Skeleton';
import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AdminContent() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const tabs = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'footer', label: 'Footer' },
    { id: 'company', label: 'Company Info' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'social', label: 'Social Links' },
    { id: 'policies', label: 'Policies' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Website Content</h1>
        <p className="text-muted-foreground">Manage the content displayed on the retailer website.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-32 mt-4" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'homepage' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="overflow-y-auto pr-4 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Homepage Heading</label>
                <Input defaultValue="Premium Wholesale Garments" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Homepage Subheading</label>
                <Input defaultValue="Uncompromising quality designed for modern retail." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">About Us</label>
                <textarea className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="We provide the best quality garments to retailers across India."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Call To Action Text</label>
                <Input defaultValue="Join our wholesale network today." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Homepage Button Text</label>
                <Input defaultValue="Become a Retailer" />
              </div>
              
              <Button>Save Changes</Button>
            </div>
            
            <div className="hidden lg:block border border-border rounded-lg bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-4">Live Preview</div>
              <div className="bg-background w-full h-[500px] rounded border border-border shadow-sm flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                <h1 className="text-4xl font-serif mb-4">Premium Wholesale Garments</h1>
                <p className="text-muted-foreground mb-8">Uncompromising quality designed for modern retail.</p>
                <Button className="rounded-none uppercase tracking-[2px] text-[11px] font-bold">Become a Retailer</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="overflow-y-auto pr-4 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input defaultValue="MNFR Clothing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="123 Wholesale Market, New Delhi, India"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Working Hours</label>
                <Input defaultValue="Mon - Sat, 10:00 AM - 7:00 PM" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Copyright Text</label>
                <Input defaultValue="© 2026 MNFR Clothing. All rights reserved." />
              </div>
              
              <Button>Save Changes</Button>
            </div>
            
            <div className="hidden lg:block border border-border rounded-lg bg-muted/30 p-4 flex flex-col">
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-4">Live Preview</div>
              <div className="bg-zinc-950 text-white w-full rounded p-8 mt-auto flex flex-col items-center text-center">
                <div className="text-2xl font-serif font-bold mb-4 tracking-tighter">MNFR</div>
                <p className="text-zinc-400 text-sm mb-4">123 Wholesale Market, New Delhi, India<br/>Mon - Sat, 10:00 AM - 7:00 PM</p>
                <p className="text-zinc-600 text-xs mt-8">© 2026 MNFR Clothing. All rights reserved.</p>
              </div>
            </div>
          </div>
        )}
        
        {['company', 'contact', 'social', 'policies'].includes(activeTab) && (
          <div className="py-12 text-center text-muted-foreground">
            Settings for {tabs.find(t => t.id === activeTab)?.label} will be loaded here.
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
