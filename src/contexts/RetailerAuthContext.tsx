import React, { createContext, useContext, useState } from 'react';

interface RetailerProfile {
  uid: string;
  ownerName: string;
  firmName: string;
  phone: string;
  gst: string;
  city: string;
  state: string;
}

interface RetailerAuthContextType {
  retailer: RetailerProfile | null;
  login: () => void;
  logout: () => void;
}

const RetailerAuthContext = createContext<RetailerAuthContextType | undefined>(undefined);

export function RetailerAuthProvider({ children }: { children: React.ReactNode }) {
  // Mock login state for now
  const [retailer, setRetailer] = useState<RetailerProfile | null>({
    uid: "dummy_retailer_123",
    ownerName: "Rahul Sharma",
    firmName: "Sharma Textiles & Garments",
    phone: "+91 98765 43210",
    gst: "22AAAAA0000A1Z5",
    city: "New Delhi",
    state: "Delhi"
  });

  const login = () => {
    setRetailer({
      uid: "dummy_retailer_123",
      ownerName: "Rahul Sharma",
      firmName: "Sharma Textiles & Garments",
      phone: "+91 98765 43210",
      gst: "22AAAAA0000A1Z5",
      city: "New Delhi",
      state: "Delhi"
    });
  };

  const logout = () => {
    setRetailer(null);
  };

  return (
    <RetailerAuthContext.Provider value={{ retailer, login, logout }}>
      {children}
    </RetailerAuthContext.Provider>
  );
}

export function useRetailer() {
  const context = useContext(RetailerAuthContext);
  if (context === undefined) {
    throw new Error('useRetailer must be used within a RetailerAuthProvider');
  }
  return context;
}
