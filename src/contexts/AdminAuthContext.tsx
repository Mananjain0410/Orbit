import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('mnfr_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mnfr_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mnfr_admin_user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Placeholder for actual Firebase authentication
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@mnfr.in' && password === 'admin123') {
          setUser({
            id: 'admin_1',
            name: 'System Admin',
            email: 'admin@mnfr.in',
            role: 'Super Admin',
            lastLogin: new Date().toISOString(),
          });
          resolve();
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
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
