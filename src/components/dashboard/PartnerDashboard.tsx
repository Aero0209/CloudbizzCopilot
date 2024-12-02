'use client';

import React from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Users, Package, BarChart3, Building2 } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';

export function PartnerDashboard() {
  return (
    <MasterLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Espace Partenaire</h1>
          <div className="flex items-center space-x-4">
            <Link href="/clients" className="text-gray-600 hover:text-gray-900">
              Clients
            </Link>
            <Link href="/rapports" className="text-gray-600 hover:text-gray-900">
              Rapports
            </Link>
            <Link href="/commissions" className="text-gray-600 hover:text-gray-900">
              Commissions
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Building2}
            label="Clients"
            value="15"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            icon={Users}
            label="Utilisateurs"
            value="75"
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            icon={Package}
            label="Services vendus"
            value="45"
            trend="+23%"
            trendUp={true}
          />
          <StatCard
            icon={BarChart3}
            label="Commission mensuelle"
            value="5 250,00 €"
            trend="+15%"
            trendUp={true}
          />
        </div>

        {/* Sections spécifiques aux partenaires */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Opportunités</h2>
            <div className="space-y-4">
              <Link 
                href="/register/company"
                className="block p-4 border rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-medium">Ajouter un client</h3>
                <p className="text-sm text-gray-500">
                  Créez un compte pour un nouveau client
                </p>
              </Link>
              <Link 
                href="/leads"
                className="block p-4 border rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-medium">Gérer les leads</h3>
                <p className="text-sm text-gray-500">
                  Suivez vos prospects et opportunités
                </p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Objectif mensuel</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
} 