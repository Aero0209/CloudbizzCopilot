'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { SystemModule, ModuleKey } from '@/types/modules';

interface ModulesContextType {
  modules: SystemModule[];
  loading: boolean;
  isModuleEnabled: (key: ModuleKey) => boolean;
  getModuleSettings: (key: ModuleKey) => any;
  toggleModule: (moduleId: string, enabled: boolean) => Promise<void>;
  updateModuleSettings: (moduleId: string, settings: any) => Promise<void>;
}

const ModulesContext = createContext<ModulesContextType | null>(null);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadModules = async () => {
    try {
      const modulesSnap = await getDocs(collection(db, 'modules'));
      const modulesData = modulesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SystemModule[];
      setModules(modulesData);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const contextValue = {
    modules,
    loading,
    isModuleEnabled: (key: ModuleKey) => 
      modules.find(m => m.key === key)?.isEnabled || false,
    getModuleSettings: (key: ModuleKey) => 
      modules.find(m => m.key === key)?.settings || {},
    toggleModule: async (moduleId: string, enabled: boolean) => {
      await updateDoc(doc(db, 'modules', moduleId), { 
        isEnabled: enabled,
        updatedAt: new Date()
      });
      await loadModules();
    },
    updateModuleSettings: async (moduleId: string, settings: any) => {
      await updateDoc(doc(db, 'modules', moduleId), { 
        settings,
        updatedAt: new Date()
      });
      await loadModules();
    }
  };

  return (
    <ModulesContext.Provider value={contextValue}>
      {children}
    </ModulesContext.Provider>
  );
}

export const useModulesContext = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModulesContext must be used within ModulesProvider');
  }
  return context;
}; 