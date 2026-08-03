import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface AppSettings {
  headerBranding?: {
    type: 'text' | 'image';
    text: string;
    imageUrl?: string;
  };
  footerBranding?: {
    brandLogo1Url?: string;
    brandLogo2Url?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    workingHours?: string;
  };
  social: {
    instagram: string;
    facebook: string;
    linkedin?: string;
    twitter?: string;
  };
  storeInfo: {
    name: string;
    logoUrl?: string;
    tagline: string;
    aboutTitle?: string;
    aboutText: string;
    aboutHeading?: string;
    aboutParagraph?: string;
    aboutButtonText?: string;
    aboutButtonLink?: string;
    aboutImage?: string;
    whyChooseTitle?: string;
    whyChooseSubtitle?: string;
    catalogTitle?: string;
    catalogSubtitle?: string;
    ctaTitle?: string;
    ctaSubtitle?: string;
    ctaButtonText?: string;
    ctaButtonLink?: string;
    footerTitle?: string;
    footerText: string;
  };
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    heroButtonText: string;
    heroImage: string;
    heroImages: string[];
    ctaText?: string;
    promoBanners: PromoBanner[];
    features: { icon: string; title: string; desc: string }[];
  };
  inventory: {
    lowStockThreshold: number;
    outOfStockBehavior: 'Show as Sold Out' | 'Hide completely' | 'Allow backorders';
  };
}

export const defaultSettings: AppSettings = {
  headerBranding: {
    type: 'text',
    text: 'Shree Nakoda Fashion',
    imageUrl: '',
  },
  footerBranding: {
    brandLogo1Url: '',
    brandLogo2Url: '',
  },
  contact: {
    email: 'wholesale@mnfr.in',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    address: '123 Textile Hub, Ring Road, Surat, Gujarat 395002',
    workingHours: 'Mon - Sat, 10:00 AM - 7:00 PM',
  },
  social: {
    instagram: 'https://instagram.com/mnfr_wholesale',
    facebook: 'https://facebook.com/mnfr_wholesale',
    twitter: 'https://twitter.com/mnfr_wholesale',
    linkedin: 'https://linkedin.com/company/mnfr-wholesale',
  },
  storeInfo: {
    name: 'MNFR Wholesale',
    logoUrl: '',
    tagline: 'Premium B2B Apparel',
    aboutTitle: 'About MNFR.',
    aboutText: 'Leading manufacturer and wholesaler of premium men\'s lowers, trackpants, and casual wear serving over 1,000 retailers across India.',
    aboutHeading: 'Crafting comfort wear with exceptional attention to detail since 2010.',
    aboutParagraph: 'We are a dedicated B2B manufacturing partner serving over 1,000 retailers across India. Our focus is purely on delivering premium fabrics, durable stitching, and modern fits that ensure high sell-through rates for your stores.',
    aboutButtonText: 'Explore Retailer Catalog',
    aboutButtonLink: '/category/lowers',
    aboutImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
    whyChooseTitle: 'Why Retailers Choose Us',
    whyChooseSubtitle: 'The MNFR. Advantage',
    catalogTitle: 'Explore Categories',
    catalogSubtitle: 'Our Catalog',
    ctaTitle: 'Ready to upgrade your inventory?',
    ctaSubtitle: 'Join hundreds of premium retailers stocking MNFR. quality wear. Register today to access exclusive wholesale pricing.',
    ctaButtonText: 'Create Retailer Account',
    ctaButtonLink: '/login',
    footerTitle: 'MNFR Wholesale Apparel',
    footerText: '© 2026 MNFR Clothing. All rights reserved.',
  },
  homepage: {
    heroTitle: 'Premium Wholesale Garments',
    heroSubtitle: 'Uncompromising quality designed for modern retail across India.',
    heroButtonText: 'Explore Collection',
    heroImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000',
    heroImages: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=2000"
    ],
    ctaText: 'Ready to upgrade your inventory? Partner with MNFR.',
    promoBanners: [
      {
        id: '1',
        title: 'New Season Performance Lowers',
        subtitle: 'Engineered poly-spandex & cotton-lycra blends designed for high sell-through',
        image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=1000',
        link: '/category/lowers'
      },
      {
        id: '2',
        title: 'Factory Direct Bulk Margins',
        subtitle: 'Zero middlemen markup with guaranteed 100% quality inspection',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1000',
        link: '/category/shorts'
      }
    ],
    features: [
      { icon: "Leaf", title: "Premium Fabrics", desc: "We source only the highest grade cotton blends and technical fabrics." },
      { icon: "ShieldCheck", title: "Quality Assured", desc: "Multi-stage quality checks ensure zero defect rate in wholesale orders." },
      { icon: "TrendingUp", title: "Latest Designs", desc: "Our catalog updates monthly with market-researched trends." },
      { icon: "Factory", title: "Direct Manufacturing", desc: "No middlemen. Factory direct pricing ensures better margins for you." },
      { icon: "Truck", title: "Fast Dispatch", desc: "90% of wholesale orders are dispatched within 24 hours." },
      { icon: "CheckCircle2", title: "Comfort Fit", desc: "Patterns perfected over years for the ideal balance of style and comfort." }
    ]
  },
  inventory: {
    lowStockThreshold: 10,
    outOfStockBehavior: 'Show as Sold Out',
  },
};

function mergeSettings(data: any): AppSettings {
  if (!data) return defaultSettings;
  
  const rawBanners = Array.isArray(data.homepage?.promoBanners) 
    ? data.homepage.promoBanners 
    : (defaultSettings.homepage.promoBanners || []);

  const promoBanners: PromoBanner[] = rawBanners.map((b: any, idx: number) => ({
    id: String(b?.id || `banner_${idx}`),
    title: String(b?.title || ''),
    subtitle: String(b?.subtitle || ''),
    image: String(b?.image || ''),
    link: String(b?.link || '')
  }));

  const rawFeatures = Array.isArray(data.homepage?.features) 
    ? data.homepage.features 
    : (defaultSettings.homepage.features || []);

  const features = rawFeatures.map((f: any) => ({
    icon: String(f?.icon || 'Check'),
    title: String(f?.title || ''),
    desc: String(f?.desc || '')
  }));

  const rawHeroImages = Array.isArray(data.homepage?.heroImages) 
    ? data.homepage.heroImages.map(String) 
    : (defaultSettings.homepage.heroImages || []);

  return {
    headerBranding: {
      type: (data.headerBranding?.type === 'image' ? 'image' : 'text') as 'text' | 'image',
      text: String(data.headerBranding?.text ?? defaultSettings.headerBranding?.text ?? 'Shree Nakoda Fashion'),
      imageUrl: String(data.headerBranding?.imageUrl ?? ''),
    },
    footerBranding: {
      brandLogo1Url: String(data.footerBranding?.brandLogo1Url ?? ''),
      brandLogo2Url: String(data.footerBranding?.brandLogo2Url ?? ''),
    },
    contact: {
      email: String(data.contact?.email ?? defaultSettings.contact.email),
      phone: String(data.contact?.phone ?? defaultSettings.contact.phone),
      whatsapp: String(data.contact?.whatsapp ?? defaultSettings.contact.whatsapp),
      address: String(data.contact?.address ?? defaultSettings.contact.address),
      workingHours: String(data.contact?.workingHours ?? defaultSettings.contact.workingHours ?? ''),
    },
    social: {
      instagram: String(data.social?.instagram ?? defaultSettings.social.instagram),
      facebook: String(data.social?.facebook ?? defaultSettings.social.facebook),
      twitter: String(data.social?.twitter ?? defaultSettings.social.twitter ?? ''),
      linkedin: String(data.social?.linkedin ?? defaultSettings.social.linkedin ?? ''),
    },
    storeInfo: {
      name: String(data.storeInfo?.name ?? defaultSettings.storeInfo.name),
      logoUrl: String(data.storeInfo?.logoUrl ?? defaultSettings.storeInfo.logoUrl ?? ''),
      tagline: String(data.storeInfo?.tagline ?? defaultSettings.storeInfo.tagline),
      aboutTitle: String(data.storeInfo?.aboutTitle ?? defaultSettings.storeInfo.aboutTitle ?? ''),
      aboutText: String(data.storeInfo?.aboutText ?? defaultSettings.storeInfo.aboutText),
      aboutHeading: String(data.storeInfo?.aboutHeading ?? defaultSettings.storeInfo.aboutHeading ?? ''),
      aboutParagraph: String(data.storeInfo?.aboutParagraph ?? defaultSettings.storeInfo.aboutParagraph ?? ''),
      aboutButtonText: String(data.storeInfo?.aboutButtonText ?? defaultSettings.storeInfo.aboutButtonText ?? ''),
      aboutButtonLink: String(data.storeInfo?.aboutButtonLink ?? defaultSettings.storeInfo.aboutButtonLink ?? ''),
      aboutImage: String(data.storeInfo?.aboutImage ?? defaultSettings.storeInfo.aboutImage ?? ''),
      whyChooseTitle: String(data.storeInfo?.whyChooseTitle ?? defaultSettings.storeInfo.whyChooseTitle ?? ''),
      whyChooseSubtitle: String(data.storeInfo?.whyChooseSubtitle ?? defaultSettings.storeInfo.whyChooseSubtitle ?? ''),
      catalogTitle: String(data.storeInfo?.catalogTitle ?? defaultSettings.storeInfo.catalogTitle ?? ''),
      catalogSubtitle: String(data.storeInfo?.catalogSubtitle ?? defaultSettings.storeInfo.catalogSubtitle ?? ''),
      ctaTitle: String(data.storeInfo?.ctaTitle ?? defaultSettings.storeInfo.ctaTitle ?? ''),
      ctaSubtitle: String(data.storeInfo?.ctaSubtitle ?? defaultSettings.storeInfo.ctaSubtitle ?? ''),
      ctaButtonText: String(data.storeInfo?.ctaButtonText ?? defaultSettings.storeInfo.ctaButtonText ?? ''),
      ctaButtonLink: String(data.storeInfo?.ctaButtonLink ?? defaultSettings.storeInfo.ctaButtonLink ?? ''),
      footerTitle: String(data.storeInfo?.footerTitle ?? defaultSettings.storeInfo.footerTitle ?? ''),
      footerText: String(data.storeInfo?.footerText ?? defaultSettings.storeInfo.footerText),
    },
    homepage: {
      heroTitle: String(data.homepage?.heroTitle ?? defaultSettings.homepage.heroTitle),
      heroSubtitle: String(data.homepage?.heroSubtitle ?? defaultSettings.homepage.heroSubtitle),
      heroButtonText: String(data.homepage?.heroButtonText ?? defaultSettings.homepage.heroButtonText),
      heroImage: String(data.homepage?.heroImage ?? defaultSettings.homepage.heroImage),
      heroImages: rawHeroImages,
      ctaText: String(data.homepage?.ctaText ?? defaultSettings.homepage.ctaText ?? ''),
      promoBanners,
      features,
    },
    inventory: {
      lowStockThreshold: Number(data.inventory?.lowStockThreshold ?? defaultSettings.inventory.lowStockThreshold),
      outOfStockBehavior: data.inventory?.outOfStockBehavior ?? defaultSettings.inventory.outOfStockBehavior,
    },
  };
}

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const docRef = doc(db, 'system', 'settings');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      const cleanDefaults = JSON.parse(JSON.stringify(defaultSettings));
      await setDoc(docRef, cleanDefaults);
      return defaultSettings;
    }
    return mergeSettings(snapshot.data());
  },

  subscribeToSettings(callback: (settings: AppSettings) => void) {
    const docRef = doc(db, 'system', 'settings');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(mergeSettings(snapshot.data()));
      } else {
        callback(defaultSettings);
      }
    });
  },

  async updateSettings(settings: AppSettings): Promise<void> {
    const docRef = doc(db, 'system', 'settings');
    const merged = mergeSettings(settings);
    const cleanSettings = JSON.parse(JSON.stringify(merged));
    await setDoc(docRef, cleanSettings);
  }
};
