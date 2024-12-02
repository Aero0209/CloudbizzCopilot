'use client';

import React from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Package, Building2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function UserDashboard() {
  return (
    <MasterLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Bienvenue sur Cloudbizz</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte Créer une entreprise */}
          <Link href="/register/company" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Créer une entreprise</h3>
              <p className="text-sm text-gray-600">
                Créez votre espace entreprise pour accéder à tous nos services cloud
              </p>
            </div>
          </Link>

          {/* Carte Explorer les services */}
          <Link href="/services" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-50 rounded-lg w-fit mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Explorer les services</h3>
              <p className="text-sm text-gray-600">
                Découvrez notre catalogue de services cloud professionnels
              </p>
            </div>
          </Link>

          {/* Carte Support */}
          <Link href="/support" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Centre d'aide</h3>
              <p className="text-sm text-gray-600">
                Besoin d'aide ? Consultez notre documentation ou contactez-nous
              </p>
            </div>
          </Link>
        </div>
      </div>
    </MasterLayout>
  );
} 