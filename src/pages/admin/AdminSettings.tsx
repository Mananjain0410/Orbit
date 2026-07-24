import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, Globe, Package, Sliders, ShieldCheck, Zap, Save } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useSettings } from '../../contexts/SettingsContext';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const tabs = [
    { id: 'general', label: 'General Settings', icon: <Sliders className="w-4 h-4" /> },
    { id: 'business', label: 'Business Profile', icon: <Building className="w-4 h-4" /> },
    { id: 'website', label: 'Website Settings', icon: <Globe className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory Rules', icon: <Package className="w-4 h-4" /> },
    { id: 'security', label: 'Security (Future)', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations (Future)', icon: <Zap className="w-4 h-4" /> }
  ];

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      showToast('Settings saved successfully', 'success');
    } catch (e) {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleChange = (section: keyof typeof formData, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-bold font-serif mb-6">Settings</h1>
        <div className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white border border-neutral-200 rounded-xl p-8 min-h-[600px]">
        {activeTab === 'general' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-muted-foreground" />
              General Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Default Currency</label>
                <select className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>INR (₹)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Timezone</label>
                <select className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Asia/Kolkata (IST)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2"><Save className="w-4 h-4" /> Save General Settings</Button>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-muted-foreground" />
              Business Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input value={formData.contact.email} onChange={(e) => handleChange('contact', 'email', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={formData.contact.phone} onChange={(e) => handleChange('contact', 'phone', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">WhatsApp</label>
                <Input value={formData.contact.whatsapp} onChange={(e) => handleChange('contact', 'whatsapp', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input value={formData.contact.address} onChange={(e) => handleChange('contact', 'address', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Instagram Link</label>
                <Input value={formData.social.instagram} onChange={(e) => handleChange('social', 'instagram', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Facebook Link</label>
                <Input value={formData.social.facebook} onChange={(e) => handleChange('social', 'facebook', e.target.value)} />
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Business Profile</Button>
          </div>
        )}

        {activeTab === 'website' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              Website Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Store Name</label>
                <Input value={formData.storeInfo.name} onChange={(e) => handleChange('storeInfo', 'name', e.target.value)} />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Tagline</label>
                <Input value={formData.storeInfo.tagline} onChange={(e) => handleChange('storeInfo', 'tagline', e.target.value)} />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Footer Text</label>
                <Input value={formData.storeInfo.footerText} onChange={(e) => handleChange('storeInfo', 'footerText', e.target.value)} />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">About Us (Brief)</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.storeInfo.aboutText}
                  onChange={(e) => handleChange('storeInfo', 'aboutText', e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Website Settings</Button>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              Inventory Rules
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-sm font-medium mb-1">Low Stock Threshold</h3>
                  <p className="text-xs text-muted-foreground mb-4">When a product's stock drops below this number, it will be marked as "Low Stock".</p>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Input type="number" value={formData.inventory.lowStockThreshold} onChange={(e) => handleChange('inventory', 'lowStockThreshold', parseInt(e.target.value) || 0)} />
                    <span className="text-sm text-muted-foreground">sets</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-sm font-medium mb-1">Out of Stock Behavior</h3>
                  <p className="text-xs text-muted-foreground mb-4">How should out-of-stock items appear to retailers?</p>
                  <select 
                    className="w-full max-w-sm h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.inventory.outOfStockBehavior}
                    onChange={(e) => handleChange('inventory', 'outOfStockBehavior', e.target.value)}
                  >
                    <option>Show as Sold Out</option>
                    <option>Hide completely</option>
                    <option>Allow backorders</option>
                  </select>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Inventory Settings</Button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              Security & Permissions
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Security settings are view-only in Phase 2.</p>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              Future Integrations
            </h2>
            <p className="text-muted-foreground text-sm mb-6">These services are planned for Phase 3 implementation.</p>
          </div>
        )}

      </div>
    </div>
  );
}
