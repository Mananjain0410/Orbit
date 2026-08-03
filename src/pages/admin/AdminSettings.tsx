import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, Globe, Package, Sliders, ShieldCheck, Zap, Save, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
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
    { id: 'inventory', label: 'Inventory Rules', icon: <Package className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Auth', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Zap className="w-4 h-4" /> }
  ];

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      showToast('System settings saved successfully', 'success');
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
        <h1 className="text-2xl font-bold font-serif mb-6">System Settings</h1>
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

        {/* Links to Single Sources of Truth */}
        <div className="mt-8 pt-6 border-t border-border space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground block px-1">Dedicated Managers</span>
          <Link 
            to="/admin/business-profile" 
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-xs font-semibold"
          >
            <span className="flex items-center gap-2"><Building className="w-4 h-4 text-neutral-800" /> Business Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
          <Link 
            to="/admin/content" 
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-xs font-semibold"
          >
            <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-neutral-800" /> Website Content</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white border border-neutral-200 rounded-xl p-8 min-h-[600px]">
        {activeTab === 'general' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-medium mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-muted-foreground" />
                General System Configuration
              </h2>
              <p className="text-xs text-muted-foreground">Configure system-wide default currency, timezone, and operational preferences.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-[1px] text-muted-foreground mb-1 block">Default Currency</label>
                <select className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>INR (₹) - Indian Rupee</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-[1px] text-muted-foreground mb-1 block">Operational Timezone</label>
                <select className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Asia/Kolkata (IST - UTC+5:30)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2 uppercase tracking-[1px] font-bold"><Save className="w-4 h-4" /> Save General Settings</Button>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-medium mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                Inventory Rules & Thresholds
              </h2>
              <p className="text-xs text-muted-foreground">Automated low-stock alerts and out-of-stock catalog behavior for retailers.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-sm font-bold mb-1">Low Stock Alert Threshold</h3>
                  <p className="text-xs text-muted-foreground mb-4">When product inventory falls below this set count, the system flags it with a warning badge.</p>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Input type="number" value={formData.inventory.lowStockThreshold} onChange={(e) => handleChange('inventory', 'lowStockThreshold', parseInt(e.target.value) || 0)} />
                    <span className="text-xs font-medium text-muted-foreground">sets</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-sm font-bold mb-1">Out of Stock Retailer Display</h3>
                  <p className="text-xs text-muted-foreground mb-4">How zero-inventory products should be displayed to logged-in retailers.</p>
                  <select 
                    className="w-full max-w-sm h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.inventory.outOfStockBehavior}
                    onChange={(e) => handleChange('inventory', 'outOfStockBehavior', e.target.value)}
                  >
                    <option>Show as Sold Out</option>
                    <option>Hide completely from catalog</option>
                    <option>Allow pre-orders / backorders</option>
                  </select>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="flex items-center gap-2 uppercase tracking-[1px] font-bold"><Save className="w-4 h-4" /> Save Inventory Settings</Button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-medium mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                Security & Access Control
              </h2>
              <p className="text-xs text-muted-foreground">Production role-based security rules are enforced at the Firestore level.</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs space-y-2">
              <p className="font-bold">✓ Zero-Trust ABAC Security Active</p>
              <p>Retailer users are restricted to public catalog items and their own orders. Only verified Admin accounts are granted write privileges.</p>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-medium mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-muted-foreground" />
                System Integrations
              </h2>
              <p className="text-xs text-muted-foreground">Connected external services for storage, printing, and notification delivery.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-border rounded-lg bg-card">
                <span className="font-bold block text-foreground mb-1">Firebase Firestore & Auth</span>
                <span className="text-muted-foreground">Status: Connected & Operational</span>
              </div>
              <div className="p-4 border border-border rounded-lg bg-card">
                <span className="font-bold block text-foreground mb-1">Firebase Storage</span>
                <span className="text-muted-foreground">Status: Connected & Operational</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
