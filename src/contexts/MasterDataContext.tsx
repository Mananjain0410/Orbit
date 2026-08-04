import React, { createContext, useContext, useState, useEffect } from 'react';
import { MasterFabric, MasterColor, MasterFit, MasterLength, MasterSize, BusinessProfile } from '../types';
import { masterDataService, defaultBusinessProfile } from '../services/masterDataService';

interface MasterDataContextType {
  fabrics: MasterFabric[];
  colors: MasterColor[];
  fits: MasterFit[];
  lengths: MasterLength[];
  sizes: MasterSize[];
  businessProfile: BusinessProfile;
  refreshMasterData: () => Promise<void>;
  addFabric: (fabric: { name: string; description?: string; isActive?: boolean }) => Promise<MasterFabric>;
  updateFabric: (id: string, updates: Partial<MasterFabric>) => Promise<void>;
  deleteFabric: (id: string) => Promise<void>;
  addColor: (color: { name: string; hexCode: string; rgb?: string; displayOrder?: number; isActive?: boolean }) => Promise<MasterColor>;
  updateColor: (id: string, updates: Partial<MasterColor>) => Promise<void>;
  deleteColor: (id: string) => Promise<void>;
  addFit: (fit: { name: string; description?: string; isActive?: boolean }) => Promise<MasterFit>;
  updateFit: (id: string, updates: Partial<MasterFit>) => Promise<void>;
  deleteFit: (id: string) => Promise<void>;
  addLength: (length: { name: string; description?: string; isActive?: boolean }) => Promise<MasterLength>;
  updateLength: (id: string, updates: Partial<MasterLength>) => Promise<void>;
  deleteLength: (id: string) => Promise<void>;
  addSize: (size: { name: string; description?: string; displayOrder?: number; isActive?: boolean }) => Promise<MasterSize>;
  updateSize: (id: string, updates: Partial<MasterSize>) => Promise<void>;
  deleteSize: (id: string) => Promise<void>;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [fabrics, setFabrics] = useState<MasterFabric[]>([]);
  const [colors, setColors] = useState<MasterColor[]>([]);
  const [fits, setFits] = useState<MasterFit[]>([]);
  const [lengths, setLengths] = useState<MasterLength[]>([]);
  const [sizes, setSizes] = useState<MasterSize[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);

  useEffect(() => {
    const unsubProfile = masterDataService.subscribeBusinessProfile((p) => setBusinessProfile(p));
    const unsubFabrics = masterDataService.subscribeFabrics((f) => setFabrics(f));
    const unsubColors = masterDataService.subscribeColors((c) => setColors(c));
    const unsubFits = masterDataService.subscribeFits((ft) => setFits(ft));
    const unsubLengths = masterDataService.subscribeLengths((l) => setLengths(l));
    const unsubSizes = masterDataService.subscribeSizes((s) => setSizes(s));

    return () => {
      unsubProfile();
      unsubFabrics();
      unsubColors();
      unsubFits();
      unsubLengths();
      unsubSizes();
    };
  }, []);

  const refreshMasterData = async () => {
    const [f, c, ft, l, sz, p] = await Promise.all([
      masterDataService.getFabrics(),
      masterDataService.getColors(),
      masterDataService.getFits(),
      masterDataService.getLengths(),
      masterDataService.getSizes(),
      masterDataService.getBusinessProfile()
    ]);
    setFabrics(f);
    setColors(c);
    setFits(ft);
    setLengths(l);
    setSizes(sz);
    setBusinessProfile(p);
  };

  const addFabric = async (fabric: { name: string; description?: string; isActive?: boolean }) => {
    const newFab = await masterDataService.addFabric(fabric);
    return newFab;
  };

  const updateFabric = async (id: string, updates: Partial<MasterFabric>) => {
    await masterDataService.updateFabric(id, updates);
  };

  const deleteFabric = async (id: string) => {
    await masterDataService.deleteFabric(id);
  };

  const addColor = async (color: { name: string; hexCode: string; rgb?: string; displayOrder?: number; isActive?: boolean }) => {
    const newCol = await masterDataService.addColor(color);
    return newCol;
  };

  const updateColor = async (id: string, updates: Partial<MasterColor>) => {
    await masterDataService.updateColor(id, updates);
  };

  const deleteColor = async (id: string) => {
    await masterDataService.deleteColor(id);
  };

  const addFit = async (fit: { name: string; description?: string; isActive?: boolean }) => {
    const newFit = await masterDataService.addFit(fit);
    return newFit;
  };

  const updateFit = async (id: string, updates: Partial<MasterFit>) => {
    await masterDataService.updateFit(id, updates);
  };

  const deleteFit = async (id: string) => {
    await masterDataService.deleteFit(id);
  };

  const addLength = async (length: { name: string; description?: string; isActive?: boolean }) => {
    const newLen = await masterDataService.addLength(length);
    return newLen;
  };

  const updateLength = async (id: string, updates: Partial<MasterLength>) => {
    await masterDataService.updateLength(id, updates);
  };

  const deleteLength = async (id: string) => {
    await masterDataService.deleteLength(id);
  };

  const addSize = async (size: { name: string; description?: string; displayOrder?: number; isActive?: boolean }) => {
    const newSize = await masterDataService.addSize(size);
    return newSize;
  };

  const updateSize = async (id: string, updates: Partial<MasterSize>) => {
    await masterDataService.updateSize(id, updates);
  };

  const deleteSize = async (id: string) => {
    await masterDataService.deleteSize(id);
  };

  const updateBusinessProfile = async (profile: Partial<BusinessProfile>) => {
    await masterDataService.updateBusinessProfile(profile);
  };

  return (
    <MasterDataContext.Provider value={{
      fabrics,
      colors,
      fits,
      lengths,
      sizes,
      businessProfile,
      refreshMasterData,
      addFabric,
      updateFabric,
      deleteFabric,
      addColor,
      updateColor,
      deleteColor,
      addFit,
      updateFit,
      deleteFit,
      addLength,
      updateLength,
      deleteLength,
      addSize,
      updateSize,
      deleteSize,
      updateBusinessProfile
    }}>
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
}
