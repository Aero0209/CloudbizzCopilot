'use client';

import { useState } from 'react';
import { useModulesContext } from '@/providers/ModulesProvider';
import { ModuleCard } from './ModuleCard';
import { Plus, Search } from 'lucide-react';

export default function ModulesManager() {
  const { modules, loading } = useModulesContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nouveau module
        </button>
      </div>

      {/* Liste des modules */}
      <div className="grid gap-6">
        {loading ? (
          // État de chargement
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement des modules...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          // État vide
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucun module trouvé</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery 
                ? "Aucun module ne correspond à votre recherche"
                : "Aucun module n'est disponible pour le moment"}
            </p>
          </div>
        ) : (
          // Liste des modules
          filteredModules.map(module => (
            <ModuleCard 
              key={module.id}
              module={module}
            />
          ))
        )}
      </div>
    </div>
  );
} 