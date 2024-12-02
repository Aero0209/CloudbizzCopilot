'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, User, Package, Trash2, Calendar, CreditCard, Clock, Plus } from 'lucide-react';
import { db } from '@/config/firebase';
import { deleteDoc, doc, addDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Company, CompanyService } from '@/types';
import { useServiceValidation } from '@/hooks/useServiceValidation';

interface Props {
  company: Company;
}

interface AvailableService {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export default function ClientUsers({ company }: Props) {
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    monthlyPrice: 0,
    duration: 0,
    userId: '',
    status: 'pending',
    serviceId: '',
    description: ''
  });
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [companyServices, setCompanyServices] = useState<CompanyService[]>(company.services);
  const [userServiceCounts, setUserServiceCounts] = useState<Record<string, {
    total: number;
    byCategory: Record<string, number>;
  }>>({});
  const { requireValidation } = useServiceValidation();

  useEffect(() => {
    const loadAvailableServices = async () => {
      try {
        const servicesSnap = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AvailableService[];
        setAvailableServices(servicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      }
    };

    loadAvailableServices();
  }, []);

  useEffect(() => {
    reloadServices();
  }, [company.id]);

  useEffect(() => {
    updateServiceCounts(company.services);
  }, [company.services]);

  const toggleUser = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRemoveService = async (serviceId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    
    setLoading(serviceId);
    try {
      await deleteDoc(doc(db, 'userServices', serviceId));
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      alert('Erreur lors de la suppression du service');
    } finally {
      setLoading(null);
    }
  };

  const getEngagementLabel = (duration: number | null) => {
    if (!duration) return "Sans engagement";
    return `Engagement ${duration} mois`;
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    
    try {
      // Si c'est un timestamp Firestore
      if (date?.toDate) {
        return format(date.toDate(), 'PPP', { locale: fr });
      }
      // Si c'est déjà une date
      if (date instanceof Date) {
        return format(date, 'PPP', { locale: fr });
      }
      // Si c'est une string
      return format(new Date(date), 'PPP', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const calculatePrice = (basePrice: number, duration: number) => {
    if (duration === 12) {
      return basePrice * 0.9; // -10%
    } else if (duration === 24) {
      return basePrice * 0.8; // -20%
    }
    return basePrice;
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = availableServices.find(s => s.id === serviceId);
    if (selectedService) {
      const finalPrice = calculatePrice(selectedService.price, newService.duration);
      setNewService(prev => ({
        ...prev,
        serviceId,
        name: selectedService.name,
        monthlyPrice: finalPrice,
        description: selectedService.description
      }));
    }
  };

  const handleDurationChange = (duration: number) => {
    const selectedService = availableServices.find(s => s.id === newService.serviceId);
    const basePrice = selectedService?.price || newService.monthlyPrice;
    const finalPrice = calculatePrice(basePrice, duration);
    
    setNewService(prev => ({
      ...prev,
      duration,
      monthlyPrice: finalPrice
    }));
  };

  const reloadServices = async () => {
    try {
      const servicesQuery = query(
        collection(db, 'userServices'),
        where('companyId', '==', company.id)
      );
      const servicesSnap = await getDocs(servicesQuery);
      const servicesData = servicesSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          serviceId: data.serviceId,
          name: data.name,
          status: data.status || 'pending',
          startDate: data.startDate,
          endDate: data.endDate,
          duration: data.duration || 0,
          monthlyPrice: data.monthlyPrice || 0,
          category: data.category,
          users: data.users || [],
          description: data.description,
          companyId: data.companyId
        };
      }) as CompanyService[];
      
      setCompanyServices(servicesData);
      updateServiceCounts(servicesData);
      setIsAddingService(false);
    } catch (error) {
      console.error('Erreur lors du rechargement des services:', error);
    }
  };

  const handleAddService = async () => {
    try {
      const selectedService = availableServices.find(s => s.id === newService.serviceId);
      if (!selectedService) return;

      const endDate = newService.duration 
        ? new Date(Date.now() + newService.duration * 30 * 24 * 60 * 60 * 1000)
        : null;

      const serviceData = {
        serviceId: newService.serviceId,
        name: selectedService.name,
        description: selectedService.description,
        monthlyPrice: newService.monthlyPrice,
        duration: newService.duration,
        status: requireValidation ? 'pending' : 'active',
        startDate: new Date(),
        endDate: endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: company.id,
        users: [{
          userId: newService.userId,
          email: company.users.find(u => u.userId === newService.userId)?.email || ''
        }],
        category: selectedService.category
      };

      await addDoc(collection(db, 'userServices'), serviceData);

      setIsAddingService(false);
      setNewService({
        name: '',
        monthlyPrice: 0,
        duration: 0,
        userId: '',
        status: 'pending',
        serviceId: '',
        description: ''
      });

      await reloadServices();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du service:', error);
    }
  };

  const updateServiceCounts = (services: CompanyService[]) => {
    const counts = company.users.reduce((acc, user) => {
      acc[user.userId] = {
        total: services.filter(s => 
          s.users && 
          Array.isArray(s.users) && 
          s.users.some(u => u.userId === user.userId)
        ).length,
        byCategory: services.reduce((catAcc, service) => {
          if (service.users?.some(u => u.userId === user.userId)) {
            catAcc[service.category] = (catAcc[service.category] || 0) + 1;
          }
          return catAcc;
        }, {} as Record<string, number>)
      };
      return acc;
    }, {} as Record<string, {
      total: number;
      byCategory: Record<string, number>;
    }>);

    setUserServiceCounts(counts);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Services utilisateurs</h2>
        <button
          onClick={() => setIsAddingService(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un service
        </button>
      </div>

      {company.users.map((user) => (
        <div 
          key={user.userId}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div 
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleUser(user.userId)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{user.email}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role === 'owner' ? 'Propriétaire' : 'Employé'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Services actifs</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {userServiceCounts[user.userId]?.total || 0}
                  </p>
                </div>
              </div>
              {expandedUsers.includes(user.userId) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {expandedUsers.includes(user.userId) && (
            <div className="border-t divide-y">
              {companyServices
                .filter(service => 
                  service.users && 
                  Array.isArray(service.users) && 
                  service.users.some(u => u.userId === user.userId)
                )
                .map((service) => (
                  <div 
                    key={service.id} 
                    className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-500">{service.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveService(service.id, user.userId);
                        }}
                        disabled={loading === service.id}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {loading === service.id ? (
                          <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <h5 className="font-medium text-gray-700">Facturation</h5>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {service.monthlyPrice}€
                          <span className="text-sm font-normal text-gray-500">/mois</span>
                        </p>
                        {service.duration && (
                          <p className="text-sm text-gray-500 mt-1">
                            Total: {service.monthlyPrice * service.duration}€
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <h5 className="font-medium text-gray-700">Engagement</h5>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {getEngagementLabel(service.duration)}
                        </p>
                        {service.duration && (
                          <p className="text-sm text-green-600 mt-1">
                            Économie de {service.duration >= 24 ? '20%' : '10%'}
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <h5 className="font-medium text-gray-700">Période</h5>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Depuis le {formatDate(service.startDate)}
                        </p>
                        {service.endDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Jusqu'au {formatDate(service.endDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    {service.status !== 'active' && (
                      <div className="mt-4 flex items-center gap-2 py-2 px-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        Service {service.status === 'pending' ? 'en attente d\'activation' : 'inactif'}
                      </div>
                    )}
                  </div>
                ))}
              {companyServices
                .filter(service => 
                  service.users && 
                  Array.isArray(service.users) && 
                  service.users.some(u => u.userId === user.userId)
                )
                .length === 0 && (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun service actif</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Modal d'ajout de service */}
      {isAddingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Ajouter un service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateur
                </label>
                <select
                  value={newService.userId}
                  onChange={(e) => setNewService({ ...newService, userId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {company.users.map(user => (
                    <option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  value={newService.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un service</option>
                  {availableServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price.toFixed(2)}€/mois
                    </option>
                  ))}
                </select>
                {newService.serviceId && (
                  <p className="mt-2 text-sm text-gray-500">
                    {availableServices.find(s => s.id === newService.serviceId)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix mensuel
                </label>
                <input
                  type="number"
                  value={newService.monthlyPrice}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  step="0.01"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée d'engagement (mois)
                </label>
                <select
                  value={newService.duration}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="0">Sans engagement</option>
                  <option value="12">12 mois (-10%)</option>
                  <option value="24">24 mois (-20%)</option>
                </select>
                {newService.duration > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    Prix initial : {availableServices.find(s => s.id === newService.serviceId)?.price.toFixed(2)}€
                    <br />
                    Prix après réduction : {newService.monthlyPrice.toFixed(2)}€
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsAddingService(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 