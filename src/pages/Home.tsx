import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Factory, TrendingUp, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '../contexts/StoreContext';
import { SEO } from '../components/SEO';
import { useSettings } from '../contexts/SettingsContext';
import { useRetailer } from '../contexts/RetailerAuthContext';
import { getCategoryUrl } from '../lib/utils';

export function Home() {
  const { settings } = useSettings();
  const { categories } = useStore();
  const { retailer } = useRetailer();

  const heroImage = settings.homepage?.heroImage || settings.homepage?.heroImages?.[0] || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000";
  const heroImages = settings.homepage?.heroImages && settings.homepage.heroImages.length > 0
    ? settings.homepage.heroImages 
    : [heroImage];
  const features = settings.homepage?.features || [];
  const promoBanners = settings.homepage?.promoBanners || [];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="flex flex-col min-h-screen">
      <SEO />
      {/* Premium Hero Banner Carousel */}
      <section className="relative h-[80vh] min-h-[600px] w-full bg-foreground flex items-center overflow-hidden">
        {heroImages.map((src, index) => (
          <div
            key={src + index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-30' : 'opacity-0'
            }`}
          >
            <img 
              src={src}
              alt="Hero Background" 
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
        ))}
        
        <div className="relative z-10 px-8 md:px-16 flex flex-col items-start text-white max-w-7xl mx-auto w-full pt-16">
          <span className="text-[10px] uppercase tracking-[3px] mb-4 block opacity-80">{settings.storeInfo.name}</span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight max-w-3xl">
            {settings.homepage?.heroTitle || settings.storeInfo.tagline}
          </h1>
          <p className="text-sm md:text-base opacity-80 mb-8 max-w-xl font-light leading-relaxed">
            {settings.homepage?.heroSubtitle || settings.storeInfo.aboutText}
          </p>
          <div className="flex gap-4 flex-wrap">
            {retailer ? (
              <>
                <Link to="/category/lowers" className="bg-white text-foreground px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white/90 transition-colors font-medium">
                  {settings.homepage?.heroButtonText || 'Browse Collection'}
                </Link>
                <Link to="/profile?tab=orders" className="bg-transparent border border-white text-white px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white hover:text-foreground transition-colors font-medium">
                  My Orders
                </Link>
                <Link to="/profile" className="bg-transparent border border-white text-white px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white hover:text-foreground transition-colors font-medium">
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/category/lowers" className="bg-white text-foreground px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white/90 transition-colors font-medium">
                  {settings.homepage?.heroButtonText || 'Explore Collection'}
                </Link>
                <Link to="/login" className="bg-transparent border border-white text-white px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white hover:text-foreground transition-colors font-medium">
                  Partner With Us
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Carousel Indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-12 h-[2px] transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banners Section */}
      {promoBanners.length > 0 && (
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promoBanners.map((banner) => (
              <Link 
                key={banner.id} 
                to={banner.link || '/category/lowers'}
                className="group relative h-80 overflow-hidden bg-foreground flex flex-col justify-end p-8 border border-border"
              >
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="relative z-10 text-white">
                  <span className="text-[10px] uppercase tracking-[2px] font-bold text-amber-300 block mb-2">Featured Banner</span>
                  <h3 className="font-serif text-2xl md:text-3xl mb-2">{banner.title}</h3>
                  <p className="text-xs md:text-sm text-white/80 max-w-md font-light leading-relaxed mb-4">{banner.subtitle}</p>
                  <span className="inline-flex items-center text-[10px] uppercase tracking-[1px] font-semibold text-white group-hover:translate-x-1 transition-transform">
                    Explore Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About Our Brand (Dynamic from CMS / Firestore) */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto w-full text-center">
        {settings.storeInfo.aboutTitle && (
          <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-4">
            {settings.storeInfo.aboutTitle}
          </span>
        )}
        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8">
          {settings.storeInfo.aboutHeading || "Crafting comfort wear with exceptional attention to detail."}
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm md:text-base mb-8">
          {settings.storeInfo.aboutParagraph || settings.storeInfo.aboutText}
        </p>
        
        {settings.storeInfo.aboutImage && (
          <div className="mb-8 max-w-2xl mx-auto overflow-hidden rounded-lg border border-border aspect-video">
            <img src={settings.storeInfo.aboutImage} alt={settings.storeInfo.aboutTitle || ''} className="w-full h-full object-cover" />
          </div>
        )}

        {settings.storeInfo.aboutButtonText && (
          <Link 
            to={settings.storeInfo.aboutButtonLink || "/category/lowers"} 
            className="inline-block bg-foreground text-background px-8 py-3 text-[11px] uppercase tracking-[1px] font-medium hover:bg-foreground/90 transition-colors"
          >
            {settings.storeInfo.aboutButtonText}
          </Link>
        )}
      </section>

      {/* Why Choose Us (Dynamic from CMS) */}
      <section className="py-24 px-4 md:px-8 bg-muted/50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {settings.storeInfo.whyChooseSubtitle && (
              <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-4">
                {settings.storeInfo.whyChooseSubtitle}
              </span>
            )}
            <h2 className="font-serif text-3xl md:text-4xl">
              {settings.storeInfo.whyChooseTitle || "Why Customers Choose Us"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              let Icon = CheckCircle2;
              if (feature.icon === 'Leaf') Icon = Leaf;
              if (feature.icon === 'ShieldCheck') Icon = ShieldCheck;
              if (feature.icon === 'TrendingUp') Icon = TrendingUp;
              if (feature.icon === 'Factory') Icon = Factory;
              if (feature.icon === 'Truck') Icon = Truck;
              
              return (
                <div key={i} className="bg-background p-8 border border-border group hover:border-foreground/20 transition-all duration-300">
                  <Icon className="w-8 h-8 mb-6 text-foreground/70 group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                  <h3 className="font-serif text-xl mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Categories (Premium Photoless Category Blocks) */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-border/60 pb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-3 font-semibold">
              {settings.storeInfo.catalogSubtitle || "Our Catalog"}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal">
              {settings.storeInfo.catalogTitle || "Explore Categories"}
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            return (
              <Link 
                key={cat.id} 
                to={getCategoryUrl(cat)} 
                className="group relative p-8 md:p-10 border border-border bg-card hover:bg-foreground hover:text-background transition-all duration-300 flex flex-col justify-between min-h-[220px] rounded-none shadow-sm hover:shadow-xl overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center text-xs uppercase tracking-[2px] font-mono text-muted-foreground group-hover:text-background/60 transition-colors">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-[1.5px] font-sans font-semibold border border-border group-hover:border-background/30 px-2.5 py-0.5 rounded-full transition-colors">
                      Collection
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif mt-6 text-foreground group-hover:text-background transition-colors tracking-tight font-medium">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground group-hover:text-background/70 mt-2 font-light line-clamp-2 transition-colors">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex items-center text-[10px] uppercase tracking-[2px] font-bold text-foreground/80 group-hover:text-background transition-colors">
                  <span className="transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    View Catalog
                  </span>
                  <ArrowRight className="ml-2 w-3.5 h-3.5 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 delay-75" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section (Dynamic from CMS) */}
      {!retailer && (
        <section className="py-32 px-4 text-center bg-foreground text-background">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            {settings.storeInfo.ctaTitle || "Ready to upgrade your inventory?"}
          </h2>
          <p className="text-muted/70 mb-10 max-w-xl mx-auto font-light">
            {settings.storeInfo.ctaSubtitle || "Join hundreds of premium customers stocking quality wear. Register today to access exclusive wholesale pricing."}
          </p>
          <Link to={settings.storeInfo.ctaButtonLink || "/login"} className="bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[1px] hover:bg-background/90 transition-colors font-medium">
            {settings.storeInfo.ctaButtonText || "Create Account"}
          </Link>
        </section>
      )}
    </div>
  );
}
