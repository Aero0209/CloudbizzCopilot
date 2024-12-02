'use client';

import React, { useEffect, useState } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Users, Package, BarChart3, Building2, FileText, Settings, Zap } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';
import { db } from '@/config/firebase';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import type { Company, Invoice } from '@/types';
import { RevenueChart, TimeFrame } from '@/components/charts/RevenueChart';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval, addMonths, parse, addDays, addYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import PendingServices from './PendingServices';

interface DashboardStats {
  companiesCount: number;
  companiesGrowth: string;
  totalUsers: number;
  usersGrowth: string;
  monthlyRevenue: number;
  revenueGrowth: string;
  activeServices: number;
  servicesGrowth: string;
}

interface RecentCompany {
  id: string;
  name: string;
  createdAt: Date;
  usersCount: number;
}

interface UserService {
  id: string;
  monthlyPrice: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: string;
}

export function MasterDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    companiesCount: 0,
    companiesGrowth: "0%",
    totalUsers: 0,
    usersGrowth: "0%",
    monthlyRevenue: 0,
    revenueGrowth: "0%",
    activeServices: 0,
    servicesGrowth: "0%"
  });
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<Array<{ date: Date; amount: number; type: TimeFrame }>>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Charger les entreprises
        const companiesSnap = await getDocs(collection(db, 'companies'));
        const companiesCount = companiesSnap.size;

        // Compter les entreprises du mois dernier
        const lastMonthCompaniesQuery = query(
          collection(db, 'companies'),
          where('createdAt', '<', firstDayThisMonth)
        );
        const lastMonthCompaniesSnap = await getDocs(lastMonthCompaniesQuery);
        const lastMonthCompaniesCount = lastMonthCompaniesSnap.size;
        const companiesGrowth = lastMonthCompaniesCount > 0 
          ? ((companiesCount - lastMonthCompaniesCount) / lastMonthCompaniesCount * 100).toFixed(0)
          : "0";

        // Charger les utilisateurs
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnap.size;

        // Compter les utilisateurs du mois dernier
        const lastMonthUsersQuery = query(
          collection(db, 'users'),
          where('createdAt', '<', firstDayThisMonth)
        );
        const lastMonthUsersSnap = await getDocs(lastMonthUsersQuery);
        const lastMonthUsersCount = lastMonthUsersSnap.size;
        const usersGrowth = lastMonthUsersCount > 0
          ? ((totalUsers - lastMonthUsersCount) / lastMonthUsersCount * 100).toFixed(0)
          : "0";

        // Charger les services actifs
        const servicesSnap = await getDocs(
          query(collection(db, 'userServices'), where('status', '==', 'active'))
        );
        const activeServices = servicesSnap.size;

        // Compter les services actifs du mois dernier
        const lastMonthServicesQuery = query(
          collection(db, 'userServices'),
          where('status', '==', 'active'),
          where('startDate', '<', firstDayThisMonth)
        );
        const lastMonthServicesSnap = await getDocs(lastMonthServicesQuery);
        const lastMonthServicesCount = lastMonthServicesSnap.size;
        const servicesGrowth = lastMonthServicesCount > 0
          ? ((activeServices - lastMonthServicesCount) / lastMonthServicesCount * 100).toFixed(0)
          : "0";

        // Calculer le revenu mensuel
        const monthlyRevenue = servicesSnap.docs.reduce((total, doc) => {
          const service = doc.data();
          return total + (Number(service.monthlyPrice) || 0);
        }, 0);

        setStats({
          companiesCount,
          companiesGrowth: `+${companiesGrowth}%`,
          totalUsers,
          usersGrowth: `+${usersGrowth}%`,
          monthlyRevenue,
          revenueGrowth: "+15%", // On garde cette valeur fixe pour l'instant
          activeServices,
          servicesGrowth: `+${servicesGrowth}%`
        });

        // Charger les entreprises récentes
        const recentCompaniesQuery = query(
          collection(db, 'companies'),
          where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          orderBy('createdAt', 'desc'),
          limit(4)
        );
        const recentCompaniesSnap = await getDocs(recentCompaniesQuery);
        const recentCompanies = await Promise.all(
          recentCompaniesSnap.docs.map(async (doc) => {
            const company = doc.data() as Company;
            const usersQuery = query(
              collection(db, 'users'),
              where('companyId', '==', doc.id)
            );
            const usersSnap = await getDocs(usersQuery);
            return {
              id: doc.id,
              name: company.name,
              createdAt: company.createdAt,
              usersCount: usersSnap.size
            };
          })
        );

        setRecentCompanies(recentCompanies);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const servicesQuery = query(
          collection(db, 'userServices'),
          where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(servicesQuery);
        const services = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserService[];

        console.log('Services bruts:', services);

        // Calculer les revenus pour chaque jour
        const calculateDailyRevenue = () => {
          const revenueByDate = new Map<string, number>();
          const now = new Date();
          const startDate = subDays(now, 7);
          const endDate = addDays(now, 7);

          services.forEach(service => {
            const serviceStartDate = service.startDate.toDate();
            const serviceEndDate = service.endDate ? service.endDate.toDate() : addYears(now, 1);
            const monthlyPrice = Number(service.monthlyPrice) || 0;
            const dailyPrice = monthlyPrice / 30;

            let currentDate = startDate;
            while (currentDate <= endDate) {
              if (currentDate >= serviceStartDate && currentDate <= serviceEndDate) {
                const dateKey = format(currentDate, 'yyyy-MM-dd');
                const currentRevenue = revenueByDate.get(dateKey) || 0;
                revenueByDate.set(dateKey, currentRevenue + dailyPrice);
              }
              currentDate = addDays(currentDate, 1);
            }
          });

          return revenueByDate;
        };

        // Calculer les revenus mensuels
        const calculateMonthlyRevenue = () => {
          const revenueByMonth = new Map<string, number>();
          const now = new Date();
          const startDate = subMonths(now, 12);
          const endDate = addMonths(now, 12);

          services.forEach(service => {
            const serviceStartDate = service.startDate.toDate();
            const serviceEndDate = service.endDate ? service.endDate.toDate() : addYears(now, 1);
            const monthlyPrice = Number(service.monthlyPrice) || 0;

            let currentDate = startDate;
            while (currentDate <= endDate) {
              if (currentDate >= serviceStartDate && currentDate <= serviceEndDate) {
                const monthKey = format(currentDate, 'yyyy-MM');
                const currentRevenue = revenueByMonth.get(monthKey) || 0;
                revenueByMonth.set(monthKey, currentRevenue + monthlyPrice);
              }
              currentDate = addMonths(currentDate, 1);
            }
          });

          return revenueByMonth;
        };

        // Calculer les revenus annuels
        const calculateYearlyRevenue = () => {
          const revenueByYear = new Map<string, number>();
          const now = new Date();
          const startDate = subYears(now, 4);
          const endDate = addYears(now, 4);

          services.forEach(service => {
            const serviceStartDate = service.startDate.toDate();
            const serviceEndDate = service.endDate ? service.endDate.toDate() : addYears(now, 1);
            const monthlyPrice = Number(service.monthlyPrice) || 0;
            const yearlyPrice = monthlyPrice * 12;

            let currentDate = startDate;
            while (currentDate <= endDate) {
              if (currentDate >= serviceStartDate && currentDate <= serviceEndDate) {
                const yearKey = format(currentDate, 'yyyy');
                const currentRevenue = revenueByYear.get(yearKey) || 0;
                revenueByYear.set(yearKey, currentRevenue + yearlyPrice);
              }
              currentDate = addYears(currentDate, 1);
            }
          });

          return revenueByYear;
        };

        // Convertir les données selon la période sélectionnée
        const dailyRevenue = calculateDailyRevenue();
        const monthlyRevenue = calculateMonthlyRevenue();
        const yearlyRevenue = calculateYearlyRevenue();

        // Combiner toutes les données
        const revenue = [
          ...Array.from(dailyRevenue.entries()).map(([dateStr, amount]) => ({
            date: parse(dateStr, 'yyyy-MM-dd', new Date()),
            amount,
            type: '7days' as const
          })),
          ...Array.from(monthlyRevenue.entries()).map(([dateStr, amount]) => ({
            date: parse(dateStr, 'yyyy-MM', new Date()),
            amount,
            type: 'monthly' as const
          })),
          ...Array.from(yearlyRevenue.entries()).map(([dateStr, amount]) => ({
            date: parse(dateStr, 'yyyy', new Date()),
            amount,
            type: 'yearly' as const
          }))
        ].sort((a, b) => a.date.getTime() - b.date.getTime());

        console.log('Données finales de revenus:', revenue);
        setRevenueData(revenue);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de revenus:', error);
      }
    };

    fetchRevenueData();
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
      <div className="min-h-screen bg-gray-50">
        <div className="p-8 flex gap-8">
          {/* Contenu principal */}
          <div className="flex-1 max-w-5xl">
            {/* En-tête avec fond dégradé */}
            <div className="relative mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold">Administration</h1>
                    <p className="mt-2 text-blue-100">Vue d'ensemble de la plateforme</p>
                  </div>
                  <Link 
                    href="/gestion" 
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                </div>
              </div>
              {/* Motif décoratif */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute right-0 top-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="transform hover:scale-105 transition-transform duration-200">
                <StatCard
                  icon={Building2}
                  label="Entreprises"
                  value={stats.companiesCount.toString()}
                  trend={stats.companiesGrowth}
                  trendUp={true}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg shadow-blue-100/50"
                  iconClassName="text-blue-600"
                />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <StatCard
                  icon={Users}
                  label="Utilisateurs"
                  value={stats.totalUsers.toString()}
                  trend={stats.usersGrowth}
                  trendUp={true}
                  className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg shadow-green-100/50"
                  iconClassName="text-green-600"
                />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <StatCard
                  icon={Package}
                  label="Services actifs"
                  value={stats.activeServices.toString()}
                  trend={stats.servicesGrowth}
                  trendUp={true}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg shadow-purple-100/50"
                  iconClassName="text-purple-600"
                />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <StatCard
                  icon={BarChart3}
                  label="Revenu mensuel"
                  value={`${stats.monthlyRevenue.toFixed(2)} €`}
                  trend={stats.revenueGrowth}
                  trendUp={true}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg shadow-orange-100/50"
                  iconClassName="text-orange-600"
                />
              </div>
            </div>

            {/* Graphique des revenus avec hauteur minimale fixe */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 min-h-[400px]">
              <RevenueChart data={revenueData} />
            </div>
          </div>

          {/* Sidebar droite avec hauteur égale au contenu principal */}
          <div className="w-96 space-y-8 sticky top-8 self-start flex flex-col">
            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  Actions rapides
                </h2>
                <div className="space-y-4">
                  <Link 
                    href="/register/company"
                    className="block p-4 rounded-xl border border-gray-200 hover:border-blue-500 transition-colors group bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Créer une entreprise</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Ajouter une nouvelle entreprise au système
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link 
                    href="/catalogue"
                    className="block p-4 rounded-xl border border-gray-200 hover:border-green-500 transition-colors group bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Gérer le catalogue</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Modifier les services disponibles
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link 
                    href="/factures"
                    className="block p-4 rounded-xl border border-gray-200 hover:border-purple-500 transition-colors group bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Voir les factures</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Gérer la facturation des entreprises
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Nouvelles entreprises avec flex-grow pour prendre l'espace restant */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  Nouvelles entreprises
                </h2>
                <div className="space-y-4">
                  {recentCompanies
                    .slice(0, 4) // Ne prendre que les 4 premières entreprises
                    .map(company => (
                      <div 
                        key={company.id} 
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{company.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {company.usersCount} utilisateur{company.usersCount > 1 ? 's' : ''}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                            {new Date(company.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
} 