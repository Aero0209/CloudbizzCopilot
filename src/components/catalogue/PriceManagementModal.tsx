'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Search, X } from 'lucide-react';
import { db } from '@/config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  writeBatch as firestoreWriteBatch,
  serverTimestamp as firestoreServerTimestamp
} from 'firebase/firestore';
import type { Company, Service, UserService } from '@/types';

interface PriceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PriceManagementModal({ isOpen, onClose }: PriceManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesSnap = await getDocs(collection(db, 'companies'));
        const companiesData = companiesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Company[];
        setCompanies(companiesData);
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <Dialog.Title className="text-lg font-semibold">
                  Gestion des prix
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedCompany ? (
                <CompanyPricing 
                  company={selectedCompany} 
                  onBack={() => setSelectedCompany(null)} 
                />
              ) : (
                <div className="p-6">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => setSelectedCompany(company)}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer"
                      >
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

function CompanyPricing({ company, onBack }: { company: Company, onBack: () => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        // Charger tous les services standards
        const servicesSnap = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];

        // Charger les services de l'entreprise
        const userServicesRef = collection(db, 'userServices');
        const q = query(userServicesRef, where('companyId', '==', company.id));
        const userServicesSnap = await getDocs(q);
        const userServicesData = userServicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          lastUpdated: doc.data().lastUpdated?.toDate()
        })) as UserService[];

        // Initialiser les prix personnalisés avec les prix actuels des services utilisateur
        const initialPrices: Record<string, number> = {};
        userServicesData.forEach(userService => {
          initialPrices[userService.serviceId] = userService.monthlyPrice;
        });

        setServices(servicesData);
        setUserServices(userServicesData);
        setCustomPrices(initialPrices);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [company.id]);

  const handlePriceChange = (serviceId: string, value: string) => {
    const newPrice = value === '' ? 0 : parseFloat(value);
    setCustomPrices(prev => ({
      ...prev,
      [serviceId]: newPrice
    }));
  };

  const handleSave = async () => {
    try {
      const batch = firestoreWriteBatch(db);
      
      // Mettre à jour les prix personnalisés dans userServices
      for (const userService of userServices) {
        const newPrice = customPrices[userService.serviceId];
        if (newPrice !== userService.monthlyPrice) {
          const userServiceRef = doc(db, 'userServices', userService.id);
          batch.update(userServiceRef, {
            monthlyPrice: newPrice,
            lastUpdated: firestoreServerTimestamp()
          });
        }
      }

      await batch.commit();
      onBack();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des prix:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2">
          ← Retour
        </button>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="p-6 border-b">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          ← Retour
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-2 font-medium">PRODUIT</th>
              <th className="pb-2 font-medium">PRIX STANDARD</th>
              <th className="pb-2 font-medium">PRIX PERSONNALISÉ</th>
              <th className="pb-2 font-medium">DIFFÉRENCE</th>
            </tr>
          </thead>
          <tbody>
            {services
              .filter(service => userServices.some(us => us.serviceId === service.id))
              .map((service) => {
                const userService = userServices.find(us => us.serviceId === service.id);
                const customPrice = customPrices[service.id];
                const difference = customPrice ? ((customPrice - service.price) / service.price) * 100 : 0;

                return (
                  <tr key={service.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.description}</div>
                      {userService && (
                        <div className="mt-1 text-xs text-blue-600">
                          Service actif • {userService.users?.length || 0} utilisateur(s)
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-gray-900">
                      {service.price.toFixed(2)} €
                    </td>
                    <td className="py-4">
                      <input
                        type="text"
                        value={customPrice}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-4">
                      <span className={difference === 0 ? 'text-gray-500' : difference > 0 ? 'text-green-600' : 'text-red-600'}>
                        {difference.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t bg-white">
        <div className="flex justify-end gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
} 