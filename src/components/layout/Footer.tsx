import React from 'react';
import { Link } from 'react-router';
import { Instagram, Facebook, Mail, Phone, MapPin, MessageCircle, FileText } from 'lucide-react';
import { useMasterData } from '../../contexts/MasterDataContext';
import { useSettings } from '../../contexts/SettingsContext';

export function Footer() {
  const { businessProfile } = useMasterData();
  const { settings } = useSettings();

  const brandLogo1 = settings.footerBranding?.brandLogo1Url;
  const brandLogo2 = settings.footerBranding?.brandLogo2Url;

  const logoSrc = businessProfile.footerLogoUrl || businessProfile.logoUrl;
  const fullAddress = [businessProfile.address, businessProfile.city, businessProfile.state, businessProfile.pinCode]
    .filter(Boolean)
    .join(', ');

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="flex flex-col gap-6">
            {(brandLogo1 || brandLogo2) && (
              <div className="flex flex-col sm:flex-row items-center justify-start gap-6">
                {brandLogo1 && (
                  <img src={brandLogo1} alt="Pool Club Logo" className="max-h-[50px] w-auto object-contain" />
                )}
                {brandLogo2 && (
                  <img src={brandLogo2} alt="KNC Logo" className="max-h-[50px] w-auto object-contain" />
                )}
              </div>
            )}
            {logoSrc ? (
              <img src={logoSrc} alt={businessProfile.brandName || settings.storeInfo?.name || ''} className="h-10 max-w-[200px] object-contain" />
            ) : (
              (businessProfile.brandName || settings.storeInfo?.name) && (
                <span className="font-serif font-bold text-3xl tracking-tighter uppercase">
                  {businessProfile.brandName || settings.storeInfo?.name}
                </span>
              )
            )}
            {(settings.storeInfo?.footerText || settings.storeInfo?.aboutText || businessProfile.businessName) && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {settings.storeInfo?.footerText || settings.storeInfo?.aboutText || businessProfile.businessName}
              </p>
            )}
            <div className="flex gap-4 text-foreground/70">
              {businessProfile.instagram && (
                <a href={businessProfile.instagram} className="hover:text-foreground transition-colors" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {businessProfile.facebook && (
                <a href={businessProfile.facebook} className="hover:text-foreground transition-colors" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-foreground/50">Contact Us</h4>
            {businessProfile.phone && (
              <a href={`tel:${businessProfile.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" /> {businessProfile.phone}
              </a>
            )}
            {businessProfile.whatsapp && (
              <a href={`https://wa.me/${businessProfile.whatsapp.replace(/\D/g, '')}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 flex-shrink-0" /> WhatsApp
              </a>
            )}
            {businessProfile.email && (
              <a href={`mailto:${businessProfile.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" /> {businessProfile.email}
              </a>
            )}
            {fullAddress && (
              <div className="flex items-start gap-3 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{fullAddress}</span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-foreground/50">Company</h4>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link to="/manufacturing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manufacturing Process</Link>
            <Link to="/quality" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Quality Control</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help & Support</Link>
          </div>

          {/* Business Credentials */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-foreground/50">Business Credentials</h4>
            {businessProfile.gstNumber && (
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">GSTIN:</span> {businessProfile.gstNumber}
              </div>
            )}
            {businessProfile.udyamNumber && (
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Udyam:</span> {businessProfile.udyamNumber}
              </div>
            )}
            {businessProfile.supportEmail && (
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Support:</span> {businessProfile.supportEmail}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground uppercase tracking-[1px]">
          <p>{businessProfile.copyrightText || (businessProfile.businessName ? `© ${new Date().getFullYear()} ${businessProfile.businessName}. All rights reserved.` : '')}</p>
          {businessProfile.businessName && (
            <div className="flex gap-6">
              <span>{businessProfile.businessName}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
