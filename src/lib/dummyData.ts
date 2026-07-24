import { Category, Product, User } from "../types";

export const dummyCategories: Category[] = [
  { id: "c1", name: "Lowers", slug: "lowers" },
  { id: "c2", name: "Capris", slug: "capris" },
  { id: "c3", name: "Bermudas", slug: "bermudas" },
  { id: "c4", name: "Boxers", slug: "boxers" },
];

export const dummyRetailers: User[] = [
  { uid: 'r1', ownerName: 'Rahul Sharma', firmName: 'Sharma Garments', phone: '9876543210', city: 'Delhi', state: 'Delhi', role: 'retailer', createdAt: Date.now() - 5000000000, updatedAt: Date.now(), status: 'active' },
  { uid: 'r2', ownerName: 'Amit Patel', firmName: 'Patel Wholesale', phone: '9876543211', city: 'Ahmedabad', state: 'Gujarat', role: 'retailer', createdAt: Date.now() - 4000000000, updatedAt: Date.now(), status: 'active' },
  { uid: 'r3', ownerName: 'Vikas Kumar', firmName: 'VK Enterprises', phone: '9876543212', city: 'Mumbai', state: 'Maharashtra', role: 'retailer', createdAt: Date.now() - 3000000000, updatedAt: Date.now(), status: 'pending' },
  { uid: 'r4', ownerName: 'Sanjay Gupta', firmName: 'Gupta Fashions', phone: '9876543213', city: 'Kanpur', state: 'Uttar Pradesh', role: 'retailer', createdAt: Date.now() - 2000000000, updatedAt: Date.now(), status: 'suspended' },
  { uid: 'r5', ownerName: 'Rajeev Singh', firmName: 'Singh Apparels', phone: '9876543214', city: 'Jaipur', state: 'Rajasthan', role: 'retailer', createdAt: Date.now() - 1000000000, updatedAt: Date.now(), status: 'active' },
];

export const dummyProducts: Product[] = Array.from({ length: 20 }).map((_, i) => {
  const cat = dummyCategories[i % dummyCategories.length];
  const fabrics = ["Premium Cotton", "Dry Fit", "Denim", "Cotton Twill", "Fleece", "Linen Blend"];
  const allColors = [
    { name: "Black", hex: "#000000" },
    { name: "Navy", hex: "#000080" },
    { name: "Grey", hex: "#808080" },
    { name: "Charcoal", hex: "#36454F" },
    { name: "Olive", hex: "#808000" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "White", hex: "#FFFFFF" }
  ];
  
  // Randomly pick 2-3 colors and add stock
  const colors = allColors.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2).map(c => ({
    ...c,
    stock: Math.random() > 0.1 ? Math.floor(Math.random() * 200) + 1 : 0 // 10% out of stock, otherwise 1-200
  }));
  
  // Images based on category (placeholders)
  const categoryImages: Record<string, string[]> = {
    c1: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800"
    ],
    c2: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512445239398-6d0c4c575b89?auto=format&fit=crop&q=80&w=800"
    ],
    c3: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522706604313-24128eebcf0f?auto=format&fit=crop&q=80&w=800"
    ],
    c4: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?auto=format&fit=crop&q=80&w=800"
    ]
  };

  return {
    id: `p${i + 1}`,
    patternNumber: `${cat.name.substring(0, 3).toUpperCase()}-${1000 + i}`,
    categoryId: cat.id,
    fabric: fabrics[i % fabrics.length],
    colors,
    price: 150 + Math.floor(Math.random() * 400),
    sizes: cat.id === 'c3' || cat.id === 'c2' ? ["28", "30", "32", "34", "36"] : ["S", "M", "L", "XL", "XXL"],
    images: categoryImages[cat.id],
    description: `Premium ${cat.name.toLowerCase()} designed for modern retail. Uncompromising quality and comfort for everyday wear.`,
    inStock: Math.random() > 0.1, // 90% in stock
    keywords: [cat.name.toLowerCase(), "wholesale", fabrics[i % fabrics.length].toLowerCase()],
    createdAt: Date.now() - (Math.random() * 10000000000),
    updatedAt: Date.now(),
  };
});
