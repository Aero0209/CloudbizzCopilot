import React from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { Order } from '@/types';

interface OrderTabsProps {
  activeTab: Order['metadata']['status'];
  onTabChange: (status: Order['metadata']['status']) => void;
  orders: Order[];
}

export default function OrderTabs({ activeTab, onTabChange, orders }: OrderTabsProps) {
  const tabs = [
    { status: 'pending', label: 'En attente', icon: <ClockIcon className="h-5 w-5" />, color: 'yellow' },
    { status: 'confirmed', label: 'Confirmées', icon: <CheckCircleIcon className="h-5 w-5" />, color: 'green' },
    { status: 'rejected', label: 'Refusées', icon: <XCircleIcon className="h-5 w-5" />, color: 'red' },
  ] as const;

  return (
    <div className="px-4">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map(({ status, label, icon, color }) => (
          <button
            key={status}
            onClick={() => onTabChange(status)}
            className={`
              group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm
              ${activeTab === status
                ? `border-${color}-600 text-${color}-600`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className={`
              mr-2 p-1 rounded-lg group-hover:bg-${color}-50
              ${activeTab === status ? `bg-${color}-50` : ''}
            `}>
              {icon}
            </span>
            {label}
            <span className={`
              ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium
              ${activeTab === status
                ? `bg-${color}-100 text-${color}-600`
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {orders.filter(order => order.metadata.status === status).length}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
} 