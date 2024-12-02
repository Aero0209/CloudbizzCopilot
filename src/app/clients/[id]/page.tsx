'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Building2, Package, Users, History } from 'lucide-react';
import type { Company, UserProfile, Service, Invoice } from '@/types';
import ClientHistory from '@/components/client/ClientHistory';
import ClientServices from '@/components/client/ClientServices';
import ClientUsers from '@/components/client/ClientUsers';
import ClientBilling from '@/components/client/ClientBilling';
import ClientOverview from '@/components/client/ClientOverview';

interface CompanyService {
  id: string;
  serviceId: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  startDate: Date;
  endDate: Date;
  duration: number;
  monthlyPrice: number;
  category: 'remote-desktop' | 'microsoft-365' | 'accounting';
  users: Array<{ userId: string; email: string }>;
  settings: Record<string, any>;
  description?: string;
  features: string[];
}

interface CompanyDetails extends Omit<Company, 'users' | 'services'> {
  id: string;
  users: UserProfile[];
  services: CompanyService[];
  invoices: Invoice[];
  stats: {
    servicesCount: number;
    monthlyRevenue: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function ClientDetailsPage() {
  const params = useParams();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [activeTab, setActiveTab] = useState('apercu');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!params.id) return;

      try {
        // Charger les données de l'entreprise
        const companyDoc = await getDoc(doc(db, 'companies', params.id as string));
        if (!companyDoc.exists()) return;

        const companyData = companyDoc.data();

        // Charger les utilisateurs
        const usersQuery = query(
          collection(db, 'users'),
          where('companyId', '==', params.id)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];

        // Charger les services
        const servicesQuery = query(
          collection(db, 'userServices'),
          where('companyId', '==', params.id)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const services = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CompanyService[];

        // Charger les factures
        const invoicesQuery = query(
          collection(db, 'invoices'),
          where('companyId', '==', params.id)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoices = invoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invoice[];

        const companyDetails: CompanyDetails = {
          id: companyDoc.id,
          ...companyData,
          users,
          services,
          invoices,
          stats: {
            servicesCount: services.length,
            monthlyRevenue: services.reduce((total, service) => total + (service.monthlyPrice || 0), 0)
          }
        } as CompanyDetails;

        setCompany(companyDetails);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [params.id]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };

    loadCategories();
  }, []);

  const renderContent = () => {
    if (!company) return null;

    // Calculer le nombre de services par utilisateur
    const userServicesCount = company.services.reduce((acc, service) => {
      // Vérifier si service.users existe et est un tableau
      if (service.users && Array.isArray(service.users)) {
        service.users.forEach(user => {
          if (!acc[user.userId]) {
            acc[user.userId] = {
              total: 0,
              byCategory: categories.reduce((catAcc, cat) => ({
                ...catAcc,
                [cat.slug]: 0
              }), {})
            };
          }
          acc[user.userId].total += 1;
          if (service.category) {
            acc[user.userId].byCategory[service.category] += 1;
          }
        });
      }
      return acc;
    }, {} as Record<string, {
      total: number;
      byCategory: Record<string, number>;
    }>);

    // Assurons-nous que tous les utilisateurs ont une entrée dans userServicesCount
    const baseCompany: Company = {
      ...company,
      users: company.users.map(user => ({
        userId: user.id,
        email: user.email,
        role: user.role === 'companyowner' ? 'owner' : 'employee',
        joinedAt: new Date(),
        servicesCount: userServicesCount[user.id] || {
          total: 0,
          byCategory: categories.reduce((acc, cat) => ({
            ...acc,
            [cat.slug]: 0
          }), {})
        },
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: company.id
      })),
      services: company.services.map(service => ({
        ...service,
        companyId: company.id,
        users: service.users || [],
        settings: service.settings || {},
        description: service.description || service.name,
        features: service.features || [],
        endDate: service.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        duration: service.duration || 12
      }))
    };

    switch (activeTab) {
      case 'apercu':
        return <ClientOverview company={baseCompany} setActiveTab={setActiveTab} />;
      case 'services':
        return <ClientServices services={company.services} />;
      case 'utilisateurs':
        return <ClientUsers company={baseCompany} />;
      case 'historique':
        return <ClientHistory company={baseCompany} />;
      default:
        return <ClientOverview company={baseCompany} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </MasterLayout>
    );
  }

  if (!company) {
    return (
      <MasterLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold">Entreprise non trouvée</h2>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="p-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-gray-500">{company.email}</p>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'apercu', label: 'Aperçu', icon: Building2 },
              { id: 'services', label: 'Services', icon: Package },
              { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
              { id: 'historique', label: 'Historique', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        {renderContent()}
      </div>
    </MasterLayout>
  );
} 