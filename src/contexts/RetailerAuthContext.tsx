import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
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
    let unsubProfile = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      unsubProfile(); // Clean up previous listener
      if (user && user.phoneNumber) {
        // We need a real-time listener for the retailer profile status
        import('firebase/firestore').then(({ doc, onSnapshot }) => {
          unsubProfile = onSnapshot(doc(db, 'retailers', user.uid), (snapshot) => {
            if (snapshot.exists()) {
              setRetailer({ uid: snapshot.id, ...(snapshot.data() as any) } as RetailerProfile);
            } else {
              setRetailer(null);
            }
            setLoading(false);
          }, (error) => {
            console.error("Error fetching retailer profile on auth change:", error);
            setRetailer(null);
            setLoading(false);
          });
        });
      } else {
        setRetailer(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubProfile();
    };
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
