import React from 'react';
import { Link } from 'react-router';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="flex flex-col gap-6">
            <span className="font-serif font-bold text-3xl tracking-tighter uppercase">
              {settings.storeInfo.name.split(' ')[0]}.
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {settings.storeInfo.aboutText}
            </p>
            <div className="flex gap-4 text-foreground/70">
              <a href={settings.social.instagram} className="hover:text-foreground transition-colors" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram className="w-5 h-5" /></a>
              <a href={settings.social.facebook} className="hover:text-foreground transition-colors" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-foreground/50">Contact Us</h4>
            <a href={`tel:${settings.contact.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" /> {settings.contact.phone}
            </a>
            <a href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href={`mailto:${settings.contact.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" /> {settings.contact.email}
            </a>
            <div className="flex items-start gap-3 text-sm text-muted-foreground mt-2">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span>{settings.contact.address}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-foreground/50">Company</h4>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link to="/manufacturing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manufacturing Process</Link>
            <Link to="/quality" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Quality Control</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help & Support</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[2px] mb-2 text-foreground/50">Legal</h4>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shipping Policy</Link>
            <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Return Policy</Link>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground uppercase tracking-[1px]">
          <p>{settings.storeInfo.footerText}</p>
          <div className="flex gap-6">
            <span>GSTIN: 03AAAAA0000A1Z5</span>
            <span>Udyam: UDYAM-PB-02-0000000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
