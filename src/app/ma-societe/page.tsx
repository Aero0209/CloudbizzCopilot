'use client';

import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, MapPin, Users, Package, CreditCard, Clock } from 'lucide-react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { CompanyService } from '@/types';
import { useRouter } from 'next/navigation';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { format } from 'date-fns';

interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  numberOfUsers: number;
  type: string;
  billing?: {
    monthlyRevenue: number;
    paymentMethod: string;
    lastPayment: Date;
  };
}

interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  status: 'active' | 'inactive' | 'pending';
}

interface Service {
  id: string;
  name: string;
  description: string;
}

type TabType = 'apercu' | 'utilisateurs' | 'services';

export default function CompanyPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [services, setServices] = useState<CompanyService[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [referenceServices, setReferenceServices] = useState<{[key: string]: Service}>({});
  const [activeTab, setActiveTab] = useState<TabType>('apercu');
  const router = useRouter();

  const getInitials = (user: CompanyUser): string => {
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || '??';
  };

  const fetchCompanyUsers = async (companyId: string) => {
    console.log('Fetching users for company:', companyId);
    setIsLoadingUsers(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      
      const users: CompanyUser[] = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as CompanyUser);
      });

      console.log('Fetched users:', users);
      setUsers(users);
    } catch (error) {
      console.error('Error fetching company users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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

          // Charger les informations de la société
          const companyDoc = await getDoc(doc(db, 'companies', currentCompanyId));
          if (companyDoc.exists()) {
            setCompanyInfo(companyDoc.data() as CompanyInfo);
          }

          // Charger les utilisateurs
          await fetchCompanyUsers(currentCompanyId);

          // Charger les services de référence
          const refServicesSnap = await getDocs(collection(db, 'services'));
          const refServicesData = refServicesSnap.docs.reduce((acc, doc) => {
            const data = doc.data();
            acc[doc.id] = { 
              id: doc.id, 
              name: data.name,
              description: data.description 
            };
            return acc;
          }, {} as {[key: string]: Service});
          setReferenceServices(refServicesData);

          // Charger les services de l'entreprise
          const userServicesQuery = query(
            collection(db, 'userServices'),
            where('companyId', '==', currentCompanyId)
          );
          const userServicesSnap = await getDocs(userServicesQuery);
          const userServicesData = userServicesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CompanyService[];
          setServices(userServicesData);
        } else {
          console.error('Utilisateur non trouvé dans la base de données');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <MasterLayout>
        <div className="p-8">
          <div className="animate-pulse">Chargement...</div>
        </div>
      </MasterLayout>
    );
  }

  if (!companyInfo) {
    return (
      <MasterLayout>
        <div className="p-8">
          <div className="text-red-500">Aucune information disponible</div>
        </div>
      </MasterLayout>
    );
  }

  const totalMonthlyPrice = services.reduce((total, service) => 
    total + (service.monthlyPrice || 0), 0
  );

  return (
    <MasterLayout>
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold">Ma société</h1>
        
        {/* Navigation des onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'apercu', label: 'Aperçu' },
              { id: 'utilisateurs', label: 'Utilisateurs' },
              { id: 'services', label: 'Services' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'apercu' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Nom de ma société</div>
                      <div className="font-medium">{companyInfo.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{companyInfo.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Téléphone</div>
                      <div className="font-medium">{companyInfo.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Adresse</div>
                      <div className="font-medium">{companyInfo.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Nombre d'utilisateurs</div>
                      <div className="font-medium">{companyInfo.numberOfUsers}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'utilisateurs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Utilisateurs</h2>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
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
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date d'ajout
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-lg">
                                  {getInitials(user)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`
                              px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}
                            `}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(user.createdAt, 'dd/MM/yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Services actifs</h2>
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">
                            {referenceServices[service.serviceId]?.description || 'Description non disponible'}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        {service.monthlyPrice?.toFixed(2)} €/mois
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {service.users?.length || 0} utilisateurs
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.duration} mois
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
} 