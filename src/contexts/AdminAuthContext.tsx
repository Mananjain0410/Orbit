import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  profilePicture?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser && firebaseUser.email) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Admin User',
          email: firebaseUser.email,
          role: 'Admin',
          lastLogin: new Date().toISOString(),
        });
        try {
          const adminRef = doc(db, 'admins', firebaseUser.uid);
          await setDoc(adminRef, {
            email: firebaseUser.email,
            role: 'admin',
            updatedAt: Date.now()
          }, { merge: true });
        } catch (e) {
          // Ignore if permission denied or offline
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser({
        id: userCredential.user.uid,
        name: userCredential.user.displayName || 'Admin User',
        email: userCredential.user.email || email,
        role: 'Admin',
        lastLogin: new Date().toISOString(),
      });
      try {
        const adminRef = doc(db, 'admins', userCredential.user.uid);
        await setDoc(adminRef, {
          email: userCredential.user.email || email,
          role: 'admin',
          updatedAt: Date.now()
        }, { merge: true });
      } catch (e) {
        // Ignore if permission error
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
