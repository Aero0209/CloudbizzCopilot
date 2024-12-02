import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { SystemModule, ModuleKey } from '@/types/modules';

export function useModules() {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);

  const isModuleEnabled = (moduleKey: ModuleKey) => {
    const module = modules.find(m => m.key === moduleKey);
    return module?.isEnabled || false;
  };

  const getModuleSettings = (moduleKey: ModuleKey) => {
    const module = modules.find(m => m.key === moduleKey);
    return module?.settings || {};
  };

  // ... autres fonctions utiles

  return {
    modules,
    loading,
    isModuleEnabled,
    getModuleSettings
  };
} 