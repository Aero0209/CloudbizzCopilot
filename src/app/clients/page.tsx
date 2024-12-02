'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { 
  Building2, Mail, Phone, MapPin, 
  Users, Package, Search, Plus, 
  FileText, BarChart3
} from 'lucide-react';
import type { Company, UserProfile } from '@/types';
import Link from 'next/link';

interface CompanyWithDetails extends Omit<Company, 'users'> {
  id: string;
  users: (UserProfile & {
    userId: string;
    joinedAt: Date;
    servicesCount: {
      total: number;
      byCategory: {
        'remote-desktop': number;
        'microsoft-365': number;
        accounting: number;
      };
    };
  })[];
  stats: {
    usersCount: number;
    servicesCount: number;
    monthlyRevenue: number;
  };
}

export default function ClientsPage() {
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesQuery = query(collection(db, 'companies'));
        const companiesSnapshot = await getDocs(companiesQuery);
        
        const companiesData = await Promise.all(companiesSnapshot.docs.map(async (doc) => {
          const companyData = doc.data();
          
          // Charger les utilisateurs
          const usersQuery = query(
            collection(db, 'users'),
            where('companyId', '==', doc.id)
          );
          const usersSnapshot = await getDocs(usersQuery);
          const users = usersSnapshot.docs.map(userDoc => ({
            ...userDoc.data(),
            id: userDoc.id
          })) as UserProfile[];
          
          // Charger les services
          const servicesQuery = query(
            collection(db, 'userServices'),
            where('companyId', '==', doc.id)
          );
          const servicesSnapshot = await getDocs(servicesQuery);
          
          return {
            id: doc.id,
            ...companyData,
            users,
            stats: {
              usersCount: users.length,
              servicesCount: servicesSnapshot.size,
              monthlyRevenue: servicesSnapshot.docs.reduce((total, doc) => {
                const service = doc.data();
                return total + (service.monthlyPrice || 0);
              }, 0)
            }
          } as CompanyWithDetails;
        }));

        setCompanies(companiesData);
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MasterLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-gray-500 mt-1">
              {companies.length} entreprise{companies.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/register/company"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouvelle entreprise
          </Link>
        </div>

        {/* Recherche et filtres */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Liste des entreprises */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/clients/${company.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* En-tête de la carte */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{company.name}</h2>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{company.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{company.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {company.stats.usersCount}
                        </div>
                        <div className="text-xs text-gray-500">Utilisateurs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {company.stats.servicesCount}
                        </div>
                        <div className="text-xs text-gray-500">Services</div>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu des utilisateurs */}
                  <div className="mt-4">
                    <div className="flex -space-x-2">
                      {company.users.slice(0, 4).map((user, index) => (
                        <div
                          key={user.id}
                          className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                          title={`${user.firstName} ${user.lastName}`}
                        >
                          <span className="text-sm text-blue-600 font-medium">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {company.users.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-medium">
                            +{company.users.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer avec revenus */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Revenu mensuel</span>
                      <span className="text-lg font-semibold text-green-600">
                        {company.stats.monthlyRevenue.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Message si aucun résultat */}
        {!loading && filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucune entreprise trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </MasterLayout>
  );
} 