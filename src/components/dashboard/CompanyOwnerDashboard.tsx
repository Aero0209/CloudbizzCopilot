'use client';

import React, { useEffect, useState } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Users, FileText, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { Invoice } from '@/types';
import { useModulesContext } from '@/providers/ModulesProvider';

interface DashboardStats {
  usersCount: number;
  unpaidInvoices: number;
  totalMonthlyBill: number;
  nextBillingDays: number;
}

interface RecentInvoice {
  id: string;
  number: string;
  total: number;
  dueDate: Date;
  status: 'sent' | 'overdue' | 'paid';
}

export function CompanyOwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    unpaidInvoices: 0,
    totalMonthlyBill: 0,
    nextBillingDays: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { isModuleEnabled } = useModulesContext();

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!auth.currentUser) return;

      try {
        setLoading(true);
        const companyId = auth.currentUser.uid;

        // Compter les utilisateurs de l'entreprise
        const usersQuery = query(
          collection(db, 'users'),
          where('companyId', '==', companyId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersCount = usersSnapshot.size;

        // Récupérer les factures impayées
        const now = new Date();
        const unpaidInvoicesQuery = query(
          collection(db, 'invoices'),
          where('companyId', '==', companyId),
          where('status', 'in', ['sent', 'overdue'])
        );
        const unpaidInvoicesSnapshot = await getDocs(unpaidInvoicesQuery);
        const unpaidInvoices = unpaidInvoicesSnapshot.size;

        // Calculer le montant total mensuel
        const servicesQuery = query(
          collection(db, 'userServices'),
          where('companyId', '==', companyId),
          where('status', '==', 'active')
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const totalMonthlyBill = servicesSnapshot.docs.reduce((total, doc) => {
          const service = doc.data();
          return total + (service.monthlyPrice * service.users.length);
        }, 0);

        // Récupérer les factures récentes
        const recentInvoicesQuery = query(
          collection(db, 'invoices'),
          where('companyId', '==', companyId),
          where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)))
        );
        const recentInvoicesSnapshot = await getDocs(recentInvoicesQuery);
        const recentInvoices = recentInvoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate.toDate()
        })) as RecentInvoice[];

        // Calculer les jours jusqu'à la prochaine facturation
        const nextBillingDate = new Date();
        nextBillingDate.setDate(1);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        const nextBillingDays = Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setStats({
          usersCount,
          unpaidInvoices,
          totalMonthlyBill,
          nextBillingDays
        });

        setRecentInvoices(recentInvoices);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  if (loading) {
    return (
      <MasterLayout>
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <div className="flex gap-4">
            <Link 
              href="/factures" 
              className="px-4 py-2 bg-white border text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Voir les factures
            </Link>
            <Link 
              href="/ma-societe" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Gérer mon entreprise
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Utilisateurs"
            value={stats.usersCount.toString()}
            trend="Actifs"
            trendUp={true}
          />
          <StatCard
            icon={FileText}
            label="Factures à payer"
            value={stats.unpaidInvoices.toString()}
            trend="En attente"
            trendUp={false}
          />
          <StatCard
            icon={BarChart3}
            label="Coût mensuel"
            value={`${stats.totalMonthlyBill.toFixed(2)} €`}
            trend="Total"
            trendUp={true}
          />
          <StatCard
            icon={Clock}
            label="Prochaine facturation"
            value={`${stats.nextBillingDays} jours`}
            trend="Restants"
            trendUp={true}
          />
        </div>
        {isModuleEnabled('billing') ? [
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Factures récentes */}
          

            <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Factures récentes</h2>
            <div className="space-y-4">
              {recentInvoices.map(invoice => (
                <div key={invoice.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Facture #{invoice.number}</h3>
                    <p className="text-sm text-gray-500">
                      Échéance : {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{invoice.total.toFixed(2)} €</div>
                    <div className={`text-sm ${
                      invoice.status === 'paid' 
                        ? 'text-green-600' 
                        : invoice.status === 'overdue' 
                        ? 'text-red-600' 
                        : 'text-orange-600'
                    }`}>
                      {invoice.status === 'paid' ? 'Payée' : invoice.status === 'overdue' ? 'En retard' : 'En attente'}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
,
          

          {/* Résumé des services */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Résumé de facturation</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Prochain paiement</span>
                  <span className="font-medium">{stats.totalMonthlyBill.toFixed(2)} €</span>
                </div>
                <div className="text-sm text-gray-500">
                  Dans {stats.nextBillingDays} jours
                </div>
              </div>
              
              {stats.unpaidInvoices > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-red-600 font-medium">
                    {stats.unpaidInvoices} facture{stats.unpaidInvoices > 1 ? 's' : ''} en attente
                  </div>
                  <div className="text-sm text-red-500">
                    Veuillez régulariser votre situation
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        ] : []}
      </div>
    </MasterLayout>
  );
} 