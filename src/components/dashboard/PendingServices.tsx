'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CheckCircle, XCircle, Clock, Building2, Calendar, CreditCard, Users } from 'lucide-react';
import type { UserService } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

interface PendingServicesProps {
  companyId?: string;
  onStatusChange?: () => void;
  onMount?: () => void;
}

export default function PendingServices({ companyId, onStatusChange, onMount }: PendingServicesProps) {
  const [pendingServices, setPendingServices] = useState<UserService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadPendingServices();
      onMount?.();
    };
    init();
  }, [onMount]);

  const loadPendingServices = async () => {
    try {
      let q = query(
        collection(db, 'userServices'),
        where('status', '==', 'pending')
      );

      if (companyId) {
        q = query(q, where('companyId', '==', companyId));
      }

      const snapshot = await getDocs(q);
      setPendingServices(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserService[]);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (serviceId: string) => {
    try {
      await updateDoc(doc(db, 'userServices', serviceId), {
        status: 'active',
        activatedAt: new Date()
      });
      await loadPendingServices();
      onStatusChange?.();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      await updateDoc(doc(db, 'userServices', serviceId), {
        status: 'rejected',
        rejectedAt: new Date()
      });
      await loadPendingServices();
      onStatusChange?.();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  // Fonction utilitaire pour convertir les dates Firestore
  const formatFirestoreDate = (date: any): Date => {
    if (!date) return new Date();
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    if (typeof date === 'number') return new Date(date);
    return new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="h-[1px] bg-gray-100"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex justify-between items-center">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pendingServices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <div className="bg-green-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Tout est à jour</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Il n'y a actuellement aucun service en attente de validation.
            Les nouveaux services apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* En-tête avec fond dégradé */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Services en attente</h2>
              <p className="text-blue-100 mt-1">
                {pendingServices.length} service{pendingServices.length > 1 ? 's' : ''} à valider
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {pendingServices.map(service => (
          <div 
            key={service.id} 
            className="p-6 hover:bg-blue-50/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                {/* En-tête du service */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                        En attente de validation
                      </span>
                    </div>
                    <p className="mt-1 text-gray-500">
                      Demandé par {service.users[0].email}
                    </p>
                  </div>
                </div>

                {/* Détails du service */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(formatFirestoreDate(service.startDate), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-xs text-gray-500">Date de début</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.monthlyPrice.toFixed(2)}€ /mois
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.duration > 0 ? (
                            <span className="text-green-600 font-medium">
                              Engagement {service.duration} mois
                            </span>
                          ) : 'Sans engagement'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.users.length} utilisateur{service.users.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex -space-x-2 mt-2">
                          {service.users.map((user) => (
                            <div 
                              key={user.userId}
                              className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                              title={user.email}
                            >
                              <span className="text-sm font-medium text-blue-600">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleApprove(service.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:shadow-green-100 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approuver</span>
                </button>
                <button
                  onClick={() => handleReject(service.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Rejeter</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingServices.length === 0 && (
        <div className="p-12 text-center">
          <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Tout est à jour</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Il n'y a actuellement aucun service en attente de validation.
          </p>
        </div>
      )}
    </div>
  );
} 