import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { retailerService, RetailerProfile } from '../services/retailerService';

interface RetailerAuthContextType {
  retailer: RetailerProfile | null;
  loading: boolean;
  login: (profile: RetailerProfile) => void;
  logout: () => Promise<void>;
  checkRetailerProfile: (uid: string) => Promise<RetailerProfile | null>;
}

const RetailerAuthContext = createContext<RetailerAuthContextType | undefined>(undefined);

export function RetailerAuthProvider({ children }: { children: React.ReactNode }) {
  const [retailer, setRetailer] = useState<RetailerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && user.phoneNumber) {
        try {
          const profile = await retailerService.getRetailerById(user.uid);
          setRetailer(profile);
        } catch (error) {
          console.error("Error fetching retailer profile on auth change:", error);
          setRetailer(null);
        }
      } else {
        setRetailer(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (profile: RetailerProfile) => {
    setRetailer(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setRetailer(null);
  };

  const checkRetailerProfile = async (uid: string) => {
    return await retailerService.getRetailerById(uid);
  };

  return (
    <RetailerAuthContext.Provider value={{ retailer, loading, login, logout, checkRetailerProfile }}>
      {!loading && children}
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
