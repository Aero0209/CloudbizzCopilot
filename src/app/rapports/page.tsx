'use client';

import React from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { BarChart, LineChart, PieChart } from '@/components/charts';
import DateRangePicker from '@/components/ui/date-range-picker';

export default function RapportsPage() {
  return (
    <MasterLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Rapports et Statistiques</h1>
        
        {/* Filtres et contrôles */}
        <div className="mb-6">
          <DateRangePicker />
        </div>

        {/* Grille de graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenus mensuels */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Revenus mensuels</h3>
            <LineChart />
          </div>

          {/* Distribution des services */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Services par catégorie</h3>
            <PieChart />
          </div>
        </div>
      </div>
    </MasterLayout>
  );
} 