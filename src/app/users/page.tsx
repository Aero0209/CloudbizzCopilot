'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Users, Plus, MoreHorizontal } from 'lucide-react';
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile, CompanyService } from '@/types';

interface CompanyUser extends UserProfile {
  services: CompanyService[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // D'abord, obtenir le companyId de l'utilisateur connecté
        const currentUserDoc = await getDocs(query(
          collection(db, 'users'),
          where('email', '==', user.email)
        ));

        if (!currentUserDoc.empty) {
          const currentUserData = currentUserDoc.docs[0].data();
          const currentCompanyId = currentUserData.companyId;
          setCompanyId(currentCompanyId);

          // Ensuite, charger tous les utilisateurs avec ce companyId
          const usersSnap = await getDocs(query(
            collection(db, 'users'),
            where('companyId', '==', currentCompanyId)
          ));

          const usersData = await Promise.all(usersSnap.docs.map(async (doc) => {
            const userData = doc.data();
            const user = {
              id: doc.id,
              email: userData.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              role: userData.role || 'user',
              createdAt: userData.createdAt?.toDate() || new Date(),
              services: [],
              companyId: userData.companyId,
              status: userData.status || 'active'
            } as CompanyUser;

            // Charger les services pour chaque utilisateur
            const servicesSnap = await getDocs(query(
              collection(db, 'userServices'),
              where('companyId', '==', currentCompanyId),
              where('users', 'array-contains', { userId: doc.id, email: userData.email })
            ));

            if (!servicesSnap.empty) {
              user.services = servicesSnap.docs.map(sDoc => ({
                id: sDoc.id,
                ...sDoc.data()
              })) as CompanyService[];
            }

            return user;
          }));

          setUsers(usersData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs de l'entreprise</h1>
            <p className="mt-1 text-sm text-gray-500">
              ID de l'entreprise: {companyId}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Ajouter un utilisateur
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
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
                  <tr key={user.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.role}
                      </span>
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
      </div>
    </MasterLayout>
  );
} 