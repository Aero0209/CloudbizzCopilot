'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package,
  Users,
  CreditCard,
  Clock,
  Search,
  ArrowRight
} from 'lucide-react';
import type { Company } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Activity {
  id: string;
  type: 'service_activated' | 'service_deleted' | 'user_added' | 'user_removed' | 'payment_received';
  description: string;
  timestamp: Date;
  metadata?: {
    serviceName?: string;
    serviceId?: string;
    duration?: number;
    users?: Array<{ userId: string; email: string; }>;
    performedBy?: {
      userId: string;
      email: string;
    };
  };
  companyId: string;
}

interface ClientHistoryProps {
  company: Company;
}

export default function ClientHistory({ company }: ClientHistoryProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadActivities = async () => {
      if (!company) return;

      try {
        setLoading(true);
        const activitiesRef = collection(db, 'activities');
        const q = query(
          activitiesRef,
          where('companyId', '==', company.id),
          orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as Activity[];

        setActivities(activitiesData);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [company]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'service_activated':
      case 'service_deleted':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'user_added':
      case 'user_removed':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'payment_received':
        return <CreditCard className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'service_activated':
        return 'bg-blue-50';
      case 'service_deleted':
        return 'bg-red-50';
      case 'user_added':
        return 'bg-purple-50';
      case 'user_removed':
        return 'bg-orange-50';
      case 'payment_received':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const filteredActivities = activities.filter(activity =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher dans l'historique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Liste des activités */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Chargement de l'historique...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucune activité enregistrée'}
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.description}</p>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    {activity.metadata && (
                      <div className="mt-2 text-sm text-gray-600">
                        {activity.metadata.serviceName && (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Service : {activity.metadata.serviceName}</span>
                            {activity.metadata.duration && (
                              <span className="text-gray-500">
                                ({activity.metadata.duration} mois)
                              </span>
                            )}
                          </div>
                        )}
                        {activity.metadata.performedBy && (
                          <div className="mt-1 text-sm text-gray-500">
                            Action effectuée par {activity.metadata.performedBy.email}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 