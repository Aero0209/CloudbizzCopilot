'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Calendar, Users, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GroupedService {
  name: string;
  serviceId: string;
  instances: Array<{
    id: string;
    startDate: Date;
    endDate: Date | null;
    monthlyPrice: number;
    status: string;
    users: Array<{ email: string; userId: string }>;
  }>;
}

export default function ClientServices({ services }: { services: any[] }) {
  const [expandedServices, setExpandedServices] = useState<string[]>([]);

  // Fonction pour convertir les timestamps Firestore en Date
  const convertFirestoreDate = (date: any): Date | null => {
    if (!date) return null;
    // Si c'est déjà une Date
    if (date instanceof Date) return date;
    // Si c'est un timestamp Firestore
    if (date?.toDate) return date.toDate();
    // Si c'est un timestamp en millisecondes
    if (typeof date === 'number') return new Date(date);
    return null;
  };

  // Grouper les services par nom et serviceId
  const groupedServices = services.reduce((acc: GroupedService[], service) => {
    const existingGroup = acc.find(
      group => group.name === service.name && group.serviceId === service.serviceId
    );

    if (existingGroup) {
      existingGroup.instances.push({
        id: service.id,
        startDate: convertFirestoreDate(service.startDate) || new Date(),
        endDate: convertFirestoreDate(service.endDate),
        monthlyPrice: service.monthlyPrice,
        status: service.status,
        users: service.users
      });
    } else {
      acc.push({
        name: service.name,
        serviceId: service.serviceId,
        instances: [{
          id: service.id,
          startDate: convertFirestoreDate(service.startDate) || new Date(),
          endDate: convertFirestoreDate(service.endDate),
          monthlyPrice: service.monthlyPrice,
          status: service.status,
          users: service.users
        }]
      });
    }
    return acc;
  }, []);

  const toggleService = (serviceId: string) => {
    setExpandedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="space-y-6">
      {groupedServices.map((group) => (
        <div 
          key={`${group.serviceId}`}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div 
            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleService(group.serviceId)}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {group.instances.length} instance{group.instances.length > 1 ? 's' : ''} active{group.instances.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-sm text-gray-500">Total mensuel</p>
                <p className="text-lg font-semibold text-gray-900">
                  {group.instances.reduce((sum, instance) => sum + instance.monthlyPrice, 0)}€
                </p>
              </div>
              {expandedServices.includes(group.serviceId) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {expandedServices.includes(group.serviceId) && (
            <div className="border-t divide-y">
              {group.instances.map((instance) => (
                <div key={instance.id} className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Période</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(instance.startDate, 'PPP', { locale: fr })}
                          {instance.endDate && (
                            <>
                              <br />
                              jusqu'au {format(instance.endDate, 'PPP', { locale: fr })}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Facturation</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {instance.monthlyPrice}€ / mois
                          <br />
                          <span className={`
                            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2
                            ${instance.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'}
                          `}>
                            {instance.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Utilisateurs ({instance.users.length})
                        </p>
                        <div className="mt-1 space-y-1">
                          {instance.users.map((user) => (
                            <p key={user.userId} className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 