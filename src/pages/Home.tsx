import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Factory, TrendingUp, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { Link } from 'react-router';
import { useStore } from '../contexts/StoreContext';
import { SEO } from '../components/SEO';
import { useSettings } from '../contexts/SettingsContext';

export function Home() {
  const { settings } = useSettings();
  const { categories } = useStore();
  const heroImages = [
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=2000"
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
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
            key={src}
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
            {settings.storeInfo.tagline}
          </h1>
          <p className="text-sm md:text-base opacity-80 mb-8 max-w-xl font-light leading-relaxed">
            {settings.storeInfo.aboutText}
          </p>
          <div className="flex gap-4">
            <Link to="/category/lowers" className="bg-white text-foreground px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white/90 transition-colors font-medium">
              Explore Collection
            </Link>
            <Link to="/login" className="bg-transparent border border-white text-white px-8 py-3 text-[11px] uppercase tracking-[1px] hover:bg-white hover:text-foreground transition-colors font-medium">
              Partner With Us
            </Link>
          </div>
        </div>

        {/* Carousel Indicators */}
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
      </section>

      {/* About Our Brand */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto w-full text-center">
        <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-4">About MNFR.</span>
        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8">
          Crafting comfort wear with exceptional attention to detail since 2010.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
          We are a dedicated B2B manufacturing partner serving over 1,000 retailers across India. 
          Our focus is purely on delivering premium fabrics, durable stitching, and modern fits 
          that ensure high sell-through rates for your stores.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 md:px-8 bg-muted/50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-4">The MNFR. Advantage</span>
            <h2 className="font-serif text-3xl md:text-4xl">Why Retailers Choose Us</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: "Premium Fabrics", desc: "We source only the highest grade cotton blends and technical fabrics." },
              { icon: ShieldCheck, title: "Quality Assured", desc: "Multi-stage quality checks ensure zero defect rate in wholesale orders." },
              { icon: TrendingUp, title: "Latest Designs", desc: "Our catalog updates monthly with market-researched trends." },
              { icon: Factory, title: "Direct Manufacturing", desc: "No middlemen. Factory direct pricing ensures better margins for you." },
              { icon: Truck, title: "Fast Dispatch", desc: "90% of wholesale orders are dispatched within 24 hours." },
              { icon: CheckCircle2, title: "Comfort Fit", desc: "Patterns perfected over years for the ideal balance of style and comfort." }
            ].map((feature, i) => (
              <div key={i} className="bg-background p-8 border border-border group hover:border-foreground/20 transition-all duration-300">
                <feature.icon className="w-8 h-8 mb-6 text-foreground/70 group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <h3 className="font-serif text-xl mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[3px] text-muted-foreground block mb-4">Our Catalog</span>
            <h2 className="font-serif text-3xl md:text-4xl">Explore Categories</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-muted flex flex-col justify-end p-6">
              <div className="absolute inset-0 z-0">
                <img 
                  src={`https://images.unsplash.com/photo-${[
                    '1556821840-3a63f95609a7', 
                    '1541099649105-f69ad21f3246', 
                    '1591195853828-11db59a44f6b', 
                    '1620799140408-edc6dcb6d633'
                  ][i % 4]}?auto=format&fit=crop&q=80&w=600`}
                  alt={cat.name}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-serif text-foreground group-hover:text-foreground transition-colors">{cat.name}</h3>
                <div className="mt-2 flex items-center text-[10px] uppercase tracking-[1px] text-foreground/70 font-medium">
                  <span className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    View Catalog
                  </span>
                  <ArrowRight className="ml-2 w-3 h-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 text-center bg-foreground text-background">
        <h2 className="font-serif text-4xl md:text-5xl mb-6">Ready to upgrade your inventory?</h2>
        <p className="text-muted/70 mb-10 max-w-xl mx-auto font-light">
          Join hundreds of premium retailers stocking MNFR. quality wear. 
          Register today to access exclusive wholesale pricing.
        </p>
        <Link to="/login" className="bg-background text-foreground px-8 py-4 text-[11px] uppercase tracking-[1px] hover:bg-background/90 transition-colors font-medium">
          Create Retailer Account
        </Link>
      </section>
    </div>
  );
}
