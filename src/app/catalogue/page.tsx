'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Package, Laptop } from 'lucide-react';
import Link from 'next/link';
import type { CatalogueModule, Category } from '@/types/catalogue';

const CataloguePage = () => {
  const [modules, setModules] = useState<CatalogueModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const q = query(collection(db, 'modules'));
        const snapshot = await getDocs(q);
        const modulesData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CatalogueModule[];
        
        setModules(modulesData.filter(m => 
          m.id.startsWith('catalogue-') && m.isEnabled
        ));
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return Package;
      case 'Laptop': return Laptop;
      default: return Package;
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
            <p className="mt-2 text-gray-500">
              Gérez vos différents catalogues
            </p>
          </div>

          {/* Grille des modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map(module => {
              const Icon = getIcon(module.icon);
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-${module.color}-500`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-${module.color}-50 rounded-xl`}>
                      <Icon className={`h-6 w-6 text-${module.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {module.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {module.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {module.categories?.map((category: Category) => (
                          <span 
                            key={category.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default CataloguePage;