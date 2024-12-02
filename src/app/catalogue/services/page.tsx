'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Package, Plus, Monitor, Calculator, LayoutGrid, CreditCard } from 'lucide-react';
import AddServiceModal from '@/components/catalogue/AddServiceModal';
import DeleteConfirmationModal from '@/components/catalogue/DeleteConfirmationModal';
import PriceManagementModal from '@/components/catalogue/PriceManagementModal';
import type { Category } from '@/types/catalogue';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

const ServicesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les catégories depuis le module
        const moduleQuery = query(
          collection(db, 'modules'),
          where('id', '==', 'catalogue-services')
        );
        const moduleSnap = await getDocs(moduleQuery);
        const module = moduleSnap.docs[0].data();
        setCategories(module.settings.categories || []);

        // Charger les services
        const servicesQuery = query(collection(db, 'services'));
        const servicesSnap = await getDocs(servicesQuery);
        const servicesData = servicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        setServices(servicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'monitor': return Monitor;
      case 'calculator': return Calculator;
      case 'microsoft': return LayoutGrid;
      default: return Package;
    }
  };

  const handlePriceUpdate = async (newPrice: number) => {
    try {
      if (!selectedService) return;
      
      // Mettre à jour le service dans l'état local
      setServices(services.map(service => 
        service.id === selectedService.id
          ? { ...service, price: newPrice }
          : service
      ));
      
      // Fermer le modal
      setShowPriceModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prix:', error);
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
        {/* En-tête avec fond dégradé et motif */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-12 px-8">
          {/* Motif décoratif */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Contenu de l'en-tête */}
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">Services</h1>
                <p className="mt-2 text-blue-100">
                  Gérez votre catalogue de services
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm text-blue-100">Total services</span>
                    <p className="text-2xl font-bold text-white">{services.length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm text-blue-100">Catégories</span>
                    <p className="text-2xl font-bold text-white">{categories.length}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Nouveau service
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Grille des catégories avec leurs services */}
          <div className="grid grid-cols-1 gap-12">
            {categories.map(category => {
              const categoryServices = services.filter(s => s.category === category.slug);
              const Icon = getIcon(category.icon);
              
              return (
                <div key={category.id} className="space-y-6">
                  {/* En-tête de la catégorie */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {categoryServices.length} service{categoryServices.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Liste des services de la catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryServices.map(service => (
                      <div
                        key={service.id}
                        className="group bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 hover:border-blue-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {service.description}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedService(service);
                              setShowPriceModal(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg group-hover:text-blue-600 transition-colors"
                            title="Gérer le prix"
                          >
                            <CreditCard className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div>
                            <span className="text-lg font-semibold text-gray-900">
                              {service.price.toFixed(2)}€
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              /mois
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Actif
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Bouton d'ajout pour la catégorie */}
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowAddModal(true);
                      }}
                      className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100">
                        <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-500 group-hover:text-blue-600">
                        Ajouter un service
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddServiceModal
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setSelectedCategory(null);
          }}
          onAdd={async () => {}}
        />
      )}

      {showPriceModal && selectedService && (
        <PriceManagementModal
          serviceId={selectedService.id}
          currentPrice={selectedService.price}
          onClose={() => {
            setShowPriceModal(false);
            setSelectedService(null);
          }}
          onUpdate={handlePriceUpdate}
        />
      )}
    </MasterLayout>
  );
};

export default ServicesPage; 