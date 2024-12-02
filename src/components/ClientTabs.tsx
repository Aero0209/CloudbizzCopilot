'use client';

import React from 'react';
import { Building2, Users, Package, FileText, Clock } from 'lucide-react';

interface ClientTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ClientTabs({ activeTab, onTabChange }: ClientTabsProps) {
  const tabs = [
    {
      id: 'overview',
      name: 'Aperçu',
      icon: Building2,
    },
    {
      id: 'users',
      name: 'Utilisateurs',
      icon: Users,
    },
    {
      id: 'services',
      name: 'Services',
      icon: Package,
    },
    {
      id: 'billing',
      name: 'Facturation',
      icon: FileText,
    },
    {
      id: 'history',
      name: 'Historique',
      icon: Clock,
    }
  ];

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 