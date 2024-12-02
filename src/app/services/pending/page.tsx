'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import PendingServices from '@/components/dashboard/PendingServices';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
}

export default function PendingServicesPage() {
  const [stats, setStats] = useState<PendingStats>({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const today = startOfDay(new Date());

      // Services en attente - Simplifier la requête
      const pendingQuery = query(
        collection(db, 'userServices'),
        where('status', '==', 'pending')
      );
      const pendingSnap = await getDocs(pendingQuery);
      
      // Mettre à jour immédiatement le nombre de services en attente
      setStats(prev => ({
        ...prev,
        pending: pendingSnap.size
      }));

      // Charger les autres stats en arrière-plan
      const [approvedSnap, rejectedSnap] = await Promise.all([
        getDocs(query(
          collection(db, 'userServices'),
          where('status', '==', 'active'),
          where('activatedAt', '>=', Timestamp.fromDate(today))
        )),
        getDocs(query(
          collection(db, 'userServices'),
          where('status', '==', 'rejected'),
          where('rejectedAt', '>=', Timestamp.fromDate(today))
        ))
      ]);

      setStats({
        pending: pendingSnap.size,
        approvedToday: approvedSnap.size,
        rejectedToday: rejectedSnap.size
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          {/* En-tête avec fond dégradé */}
          <div className="relative mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">Services en attente</h1>
                  <p className="mt-2 text-blue-100">
                    Gérez les demandes d'activation de services
                  </p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">En attente</p>
                      {loading ? (
                        <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.pending}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Approuvés aujourd'hui</p>
                      {loading ? (
                        <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.approvedToday}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Rejetés aujourd'hui</p>
                      {loading ? (
                        <div className="h-8 w-16 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.rejectedToday}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motif décoratif */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
          </div>

          {/* Liste des services en attente */}
          <PendingServices 
            onStatusChange={loadStats} 
            onMount={loadStats} 
          />
        </div>
      </div>
    </MasterLayout>
  );
} 