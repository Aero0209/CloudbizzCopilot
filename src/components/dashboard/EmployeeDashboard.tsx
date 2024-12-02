'use client';

import React, { useEffect, useState } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Users, Package, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';

export function EmployeeDashboard() {
  const [stats, setStats] = useState({
    clientsCount: 0,
    activeTickets: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Charger les statistiques de l'employé
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <MasterLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <Link 
            href="/clients" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Gérer les clients
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Building2}
            label="Clients actifs"
            value={stats.clientsCount.toString()}
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            icon={Clock}
            label="Tickets en cours"
            value={stats.activeTickets.toString()}
            trend="-5%"
            trendUp={false}
          />
          <StatCard
            icon={Package}
            label="Tâches en attente"
            value={stats.pendingTasks.toString()}
            trend="+3%"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tickets récents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Tickets récents</h2>
            <div className="space-y-4">
              {/* Liste des tickets */}
            </div>
          </div>

          {/* Tâches à faire */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Tâches à faire</h2>
            <div className="space-y-4">
              {/* Liste des tâches */}
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
} 