'use client';

import React, { useState, useEffect } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Package, 
  BarChart3,
  Mail,
  Calendar,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile, CompanyService } from '@/types';

interface CompanyUser extends UserProfile {
  services: CompanyService[];
}

export default function ClientDashboard() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!auth.currentUser) return;

      try {
        // Charger les informations de la société
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('id', '==', auth.currentUser.uid)
        ));
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          const companyId = userData.companyId;

          // Charger les utilisateurs de la société
          const usersSnap = await getDocs(query(
            collection(db, 'users'),
            where('companyId', '==', companyId)
          ));

          const usersData = await Promise.all(usersSnap.docs.map(async (doc) => {
            const userData = doc.data() as CompanyUser;
            
            // Charger les services de l'utilisateur
            const servicesSnap = await getDocs(query(
              collection(db, 'userServices'),
              where('companyId', '==', companyId),
              where('users', 'array-contains', { userId: doc.id })
            ));

            userData.services = servicesSnap.docs.map(sDoc => sDoc.data() as CompanyService);
            return userData;
          }));

          setUsers(usersData);

          // Charger les données de la société
          const companySnap = await getDocs(query(
            collection(db, 'companies'),
            where('id', '==', companyId)
          ));

          if (!companySnap.empty) {
            setCompanyData(companySnap.docs[0].data());
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <MasterLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="p-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Ma société
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Liste des utilisateurs</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Ajouter un utilisateur
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {user.services.map((service) => (
                              <span
                                key={service.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {service.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Actif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-500">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="mt-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600">+12%</span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-500">Utilisateurs actifs</h3>
                <p className="mt-2 text-3xl font-semibold">{users.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600">+8%</span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-500">Services actifs</h3>
                <p className="mt-2 text-3xl font-semibold">
                  {companyData?.services?.length || 0}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600">+15%</span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-500">Coût mensuel</h3>
                <p className="mt-2 text-3xl font-semibold">
                  {companyData?.billing?.monthlyRevenue?.toFixed(2) || '0.00'} €
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Informations de la société</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Coordonnées</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <span>{companyData?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>{companyData?.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Facturation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>Prochaine facturation: {new Date(companyData?.billing?.nextBillingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MasterLayout>
  );
} 