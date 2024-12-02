import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Package, X, Users, Clock, Euro, Loader2 } from 'lucide-react';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore';
import type { Service, Company, CompanyService } from '@/types';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onServiceAdded: () => void;
}

interface User {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

export default function AddServiceModal({ isOpen, onClose, company, onServiceAdded }: AddServiceModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [duration, setDuration] = useState<number>(12);
  const [hasCommitment, setHasCommitment] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const servicesSnap = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        setServices(servicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('companyId', '==', company.id));
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen) {
      loadServices();
      loadUsers();
    }
  }, [isOpen, company.id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedService('');
      setSelectedUsers([]);
      setDuration(12);
      setHasCommitment(true);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedService || selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      const service = services.find(s => s.id === selectedService);
      if (!service) return;

      const selectedUsersData = users
        .filter(user => selectedUsers.includes(user.id))
        .map(user => ({
          userId: user.id,
          email: user.email
        }));

      const newService = {
        serviceId: service.id,
        name: service.name,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
        duration: hasCommitment ? duration : 1,
        monthlyPrice: service.price,
        users: selectedUsersData,
        companyId: company.id,
        createdAt: new Date()
      };

      // Add to userServices collection
      const serviceDoc = await addDoc(collection(db, 'userServices'), newService);

      // Update company's monthly revenue
      const companyRef = doc(db, 'companies', company.id);
      await updateDoc(companyRef, {
        'billing.monthlyRevenue': (company.billing?.monthlyRevenue || 0) + (service.price * selectedUsers.length)
      });

      // Add activity to activities collection
      await addDoc(collection(db, 'activities'), {
        companyId: company.id,
        type: 'service_activated',
        description: `Ajout du service ${service.name}`,
        timestamp: new Date(),
        metadata: {
          serviceName: service.name,
          serviceId: serviceDoc.id,
          duration: hasCommitment ? duration : 1,
          users: selectedUsersData
        }
      });

      onServiceAdded();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du service:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const monthlyPrice = selectedServiceData 
    ? selectedServiceData.price * selectedUsers.length 
    : 0;
  const totalCommitmentPrice = hasCommitment ? monthlyPrice * duration : monthlyPrice;

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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Ajouter des services
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Service selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Service
                    </label>
                    {loadingServices ? (
                      <div className="flex items-center justify-center h-10">
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Sélectionnez un service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.price.toFixed(2)} €/mois
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Duration selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Engagement
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasCommitment}
                          onChange={(e) => {
                            setHasCommitment(e.target.checked);
                            if (!e.target.checked) setDuration(12);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Avec engagement</span>
                      </label>
                    </div>
                    {hasCommitment && (
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value={12}>12 mois</option>
                        <option value={24}>24 mois</option>
                        <option value={36}>36 mois</option>
                      </select>
                    )}
                  </div>

                  {/* User selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      Utilisateurs ({selectedUsers.length} sélectionnés)
                    </label>
                    {loadingUsers ? (
                      <div className="flex items-center justify-center h-10">
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                        {users.map((user) => (
                          <label
                            key={user.id}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3">{user.email}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price summary */}
                  {selectedService && selectedUsers.length > 0 && (
                    <div className="rounded-lg bg-blue-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Euro className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Prix mensuel</span>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">
                          {monthlyPrice.toFixed(2)} €
                        </span>
                      </div>
                      {hasCommitment && (
                        <div className="pt-3 border-t border-blue-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800">Prix total de l'engagement ({duration} mois)</span>
                            <span className="text-lg font-semibold text-blue-800">
                              {totalCommitmentPrice.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedService || selectedUsers.length === 0 || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      'Ajouter'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 