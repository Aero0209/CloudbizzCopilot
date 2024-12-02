import React from 'react';
import { Order } from '@/types';
import { getStatusColor, getStatusLabel } from './utils';
import { EyeIcon, CheckIcon, XIcon, Users, Calendar, CreditCard } from 'lucide-react';
import { 
  doc, 
  writeBatch, 
  collection, 
  serverTimestamp, 
  getDoc, 
  updateDoc,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { auth } from '@/config/firebase';
import { CompanyActivity } from '@/types/index';
import * as firebase from 'firebase/app';

interface OrderCardProps {
  order: Order;
  onStatusChange?: () => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const handleStatusChange = async (newStatus: Order['metadata']['status']) => {
    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, 'orders', order.id);
      const now = new Date();
      const companyId = order.customer.companyId;

      if (!companyId) {
        throw new Error('ID de l\'entreprise non trouvé');
      }

      // Mettre à jour le statut de la commande
      batch.update(orderRef, {
        'metadata.status': newStatus,
        'metadata.updatedAt': serverTimestamp(),
      });

      // Créer une activité
      const activityRef = doc(collection(db, 'activities'));
      const activityData = {
        type: newStatus === 'confirmed' ? 'service_activated' : 'service_deleted',
        description: newStatus === 'confirmed' 
          ? `Confirmation de la commande #${order.id.slice(0, 8)}`
          : `Rejet de la commande #${order.id.slice(0, 8)}`,
        timestamp: serverTimestamp(),
        companyId: companyId,
        userId: auth.currentUser?.uid || '',
        userEmail: auth.currentUser?.email || '',
        metadata: {
          orderId: order.id,
          services: order.services.map(s => ({
            name: s.name,
            duration: s.duration
          })),
          performedBy: {
            userId: auth.currentUser?.uid || '',
            email: auth.currentUser?.email || ''
          }
        }
      };

      batch.set(activityRef, activityData);

      // Si la commande est confirmée, créer les services
      if (newStatus === 'confirmed') {
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);
        
        if (!companySnap.exists()) {
          throw new Error('Entreprise non trouvée');
        }

        // Créer un service pour chaque service commandé (pas pour chaque utilisateur)
        for (const service of order.services) {
          const userServiceRef = doc(collection(db, 'userServices'));
          const serviceData = {
            companyId: companyId,
            name: service.name,
            serviceId: service.id,
            users: order.users.map(user => ({ 
              userId: user.userId, 
              email: user.email 
            })),
            status: 'active',
            startDate: serverTimestamp(),
            endDate: service.duration 
              ? new Date(now.getTime() + service.duration * 30 * 24 * 60 * 60 * 1000) 
              : null,
            duration: service.duration,
            monthlyPrice: service.discountedPrice,
            orderId: order.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            commitment: {
              hasCommitment: service.duration > 0,
              duration: service.duration || 0,
              startDate: serverTimestamp(),
              endDate: service.duration 
                ? new Date(now.getTime() + service.duration * 30 * 24 * 60 * 60 * 1000)
                : null
            },
            pricing: {
              basePrice: service.basePrice,
              discountedPrice: service.discountedPrice,
              discount: service.discount,
              total: service.totalPrice
            }
          };

          batch.set(userServiceRef, serviceData);

          
        }

        // Mettre à jour le revenu mensuel
        const currentRevenue = companySnap.data()?.billing?.monthlyRevenue || 0;
        batch.update(companyRef, {
          'billing.monthlyRevenue': currentRevenue + order.billing.monthlyBaseTotal
        });
      }

      await batch.commit();
      onStatusChange?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      if (error instanceof Error) {
        console.error('Détails de l\'erreur:', error.message);
      }
    }
  };

  // Calculer le total mensuel par utilisateur
  const monthlyPerUser = order.billing.monthlyBaseTotal / order.users.length;

  // Obtenir la durée d'engagement maximale ou 1 mois si pas d'engagement
  const getDuration = () => {
    const maxDuration = Math.max(...order.services.map(s => s.duration || 0));
    return maxDuration === 0 ? '1 mois' : `${maxDuration} mois`;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors">
      {/* En-tête de la commande */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.metadata.status)}`}>
            {getStatusLabel(order.metadata.status)}
          </span>
          <span className="text-sm text-gray-500">
            Commande #{order.id.slice(0, 8)}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(order.metadata.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {order.metadata.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('confirmed')}
                className="p-2 hover:bg-green-50 text-green-600 rounded-full"
                title="Confirmer la commande"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="p-2 hover:bg-red-50 text-red-600 rounded-full"
                title="Rejeter la commande"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </>
          )}
          <button 
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={() => {/* Ajouter la logique pour voir les détails */}}
          >
            <EyeIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Informations de la société */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900">{order.customer.company.name}</h3>
        <p className="text-sm text-gray-500">{order.customer.company.contact.email}</p>
      </div>

      {/* Détails de la commande */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{order.users.length} utilisateurs</p>
            <p className="text-xs text-gray-500">€{monthlyPerUser.toFixed(2)}/utilisateur/mois</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{getDuration()}</p>
            <p className="text-xs text-gray-500">
              {Math.max(...order.services.map(s => s.duration || 0)) === 0 
                ? 'Sans engagement' 
                : 'Durée d\'engagement'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{order.billing.method}</p>
            <p className="text-xs text-gray-500">Mode de paiement</p>
          </div>
        </div>
      </div>

      {/* Liste des services */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Services commandés</h3>
            <ul className="space-y-2">
              {order.services.map((service, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                        {service.duration ? `${service.duration} mois` : '1 mois'}
                      </span>
                      {service.discount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-600 rounded-full">
                          -{(service.discount * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-auto">
                    <p className="text-sm font-medium text-gray-900">
                      €{service.discountedPrice.toFixed(2)}/mois
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: €{service.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total mensuel</p>
            <p className="text-xl font-bold text-gray-900">
              €{order.billing.monthlyBaseTotal.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total engagement
            </p>
            <p className="text-lg font-semibold text-blue-600">
              €{order.billing.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 