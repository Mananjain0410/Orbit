import React, { useState, useEffect } from 'react';
import { SEO } from '../../components/SEO';
import { useMasterData } from '../../contexts/MasterDataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Save, CheckCircle, Globe, Phone, Mail, FileText, Share2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { auditLogService } from '../../services/auditLogService';

export function AdminBusinessProfile() {
  const { businessProfile, updateBusinessProfile } = useMasterData();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(businessProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setFormData(businessProfile);
    }
  }, [businessProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.brandName) {
      showToast('Business Name and Brand Name are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateBusinessProfile(formData);
      await auditLogService.logAction('business_profile_updated', `Updated Business Profile for ${formData.businessName}`);
      showToast('Business Profile saved successfully!', 'success');
    } catch (err) {
      console.error('Save business profile error:', err);
      showToast('Failed to save business profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <SEO title="Business Profile CMS - Business Portal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Business Profile CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your official firm identity, tax credentials, contact details, and social channels.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 uppercase tracking-[1px] font-bold">
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: Identity */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight">1. Business Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Business Registered Name *</label>
              <Input 
                value={formData.businessName || ''}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Registered Business Name"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Brand Trade Name *</label>
              <Input 
                value={formData.brandName || ''}
                onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Tax Credentials & Compliance */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileText className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight">2. Tax Credentials & Registration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">GST Registration Number</label>
              <Input 
                value={formData.gstNumber || ''}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="e.g. 24AAACM1234F1Z2"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Udyam Registration Number</label>
              <Input 
                value={formData.udyamNumber || ''}
                onChange={e => setFormData({ ...formData, udyamNumber: e.target.value })}
                placeholder="e.g. UDYAM-GJ-01-0012345"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Office Address & Location */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Globe className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight">3. Office Address & Dispatch Hub</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Street Address / Industrial Complex</label>
              <Input 
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 123 Textile Hub, Ring Road"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">City</label>
                <Input 
                  value={formData.city || ''}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Surat"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">State</label>
                <Input 
                  value={formData.state || ''}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Gujarat"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Country</label>
                <Input 
                  value={formData.country || ''}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. India"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">PIN Code</label>
                <Input 
                  value={formData.pinCode || ''}
                  onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="e.g. 395002"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Contact & Support */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Phone className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight">4. Contact Channels & Online Support</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Primary Phone Number</label>
              <Input 
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">WhatsApp Business Hotline</label>
              <Input 
                value={formData.whatsapp || ''}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Official Inquiry Email</label>
              <Input 
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="wholesale@yourcompany.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Support Email</label>
              <Input 
                type="email"
                value={formData.supportEmail || ''}
                onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
                placeholder="support@yourcompany.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Official Website URL</label>
              <Input 
                value={formData.website || ''}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Social Media & Copyright */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Share2 className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight">5. Social Media & Copyright Notice</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Instagram Profile URL</label>
              <Input 
                value={formData.instagram || ''}
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/your_brand"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Facebook Page URL</label>
              <Input 
                value={formData.facebook || ''}
                onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/your_brand"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Footer Copyright Text</label>
              <Input 
                value={formData.copyrightText || ''}
                onChange={e => setFormData({ ...formData, copyrightText: e.target.value })}
                placeholder="© 2026 Your Business Name. All rights reserved."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="submit" disabled={isSaving} className="uppercase tracking-[1px] font-bold px-8">
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
