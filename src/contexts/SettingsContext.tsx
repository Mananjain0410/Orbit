import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, defaultSettings, settingsService } from '../services/settingsService';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = settingsService.subscribeToSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    await settingsService.updateSettings(newSettings);
  };

  if (loading) {
    return null; 
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
