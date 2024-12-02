import React, { useState, useEffect } from 'react';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Package,
  FileText,
  Users,
  Loader2
} from 'lucide-react';
import type { Company, CompanyService } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import PendingServices from '@/components/dashboard/PendingServices';
import { useModulesContext } from '@/providers/ModulesProvider';
import ClientBilling from '@/components/client/ClientBilling';

interface ClientOverviewProps {
  company: Company;
  setActiveTab: (tab: string) => void;
}

export default function ClientOverview({ company, setActiveTab }: ClientOverviewProps) {
  const { isModuleEnabled } = useModulesContext();
  const [services, setServices] = useState<CompanyService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      if (!company) return;
      
      try {
        setLoading(true);
        const servicesQuery = query(
          collection(db, 'userServices'),
          where('companyId', '==', company.id)
        );
        const servicesSnap = await getDocs(servicesQuery);
        const servicesData = servicesSnap.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          users: doc.data().users || [],
          monthlyPrice: doc.data().monthlyPrice || 0,
          duration: doc.data().duration || 0
        })) as CompanyService[];
        setServices(servicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [company]);

  if (!company) return null;

  return (
    <div className="grid grid-cols-3 gap-8">
      {/* Informations du client */}
      <div className="col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informations du client</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Entreprise</h3>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{company.name}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p>{company.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <p>{company.phone}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Adresse</h3>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p>{company.address}</p>
                  <p>{company.postalCode} {company.city}</p>
                  <p>{company.country}</p>
                </div>
              </div>
            </div>

            {isModuleEnabled('billing') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Facturation</h2>
                <ClientBilling company={company} />
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Services</h2>
            <button onClick={() => setActiveTab('services')} className="text-sm text-blue-600 hover:text-blue-700">
              Gérer les services
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : services.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Aucun service actif
              </div>
            ) : (
              services.map((service) => (
                <div key={service.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration === 1 ? (
                            'Sans engagement'
                          ) : (
                            `${service.duration} mois`
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {(service.users && Array.isArray(service.users) ? service.users.length : 0)} 
                          utilisateur{(service.users?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {service.monthlyPrice?.toFixed(2) || '0.00'} €/mois
                      </div>
                      <div className="text-sm text-gray-500">
                        par utilisateur
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Informations rapides */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informations rapides</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Services utilisés</h3>
              <p className="text-2xl font-semibold mt-1">{services.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Mode de facturation</h3>
              <p className="text-lg font-medium mt-1">Mensuel</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-2">
            <button onClick={() => setActiveTab('services')} className="w-full flex items-center justify-between p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Gérer les services
              </span>
              →
            </button>
            <button onClick={() => setActiveTab('billing')} className="w-full flex items-center justify-between p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Voir la facturation
              </span>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 