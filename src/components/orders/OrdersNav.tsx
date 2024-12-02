import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InboxIcon,
  HistoryIcon,
  SettingsIcon
} from 'lucide-react';
import { Order } from '@/types';

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  count?: number;
}

function NavLink({ href, icon: Icon, children, count }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span>{children}</span>
      </div>
      {count !== undefined && (
        <span className={`
          px-2 py-1 rounded-full text-xs
          ${isActive 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-600'
          }
        `}>
          {count}
        </span>
      )}
    </Link>
  );
}

interface OrdersNavProps {
  counts: {
    pending: number;
    confirmed: number;
    rejected: number;
  };
  activeTab: Order['metadata']['status'];
  onTabChange: (status: Order['metadata']['status']) => void;
}

export default function OrdersNav({ counts, activeTab, onTabChange }: OrdersNavProps) {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/orders',
      icon: InboxIcon,
      label: 'Toutes les commandes',
      count: counts.pending + counts.confirmed + counts.rejected
    },
    { 
      href: '/orders/pending',
      icon: ClockIcon,
      label: 'En attente',
      count: counts.pending,
      status: 'pending' as const
    },
    { 
      href: '/orders/confirmed',
      icon: CheckCircleIcon,
      label: 'Confirmées',
      count: counts.confirmed,
      status: 'confirmed' as const
    },
    { 
      href: '/orders/rejected',
      icon: XCircleIcon,
      label: 'Refusées',
      count: counts.rejected,
      status: 'rejected' as const
    },
    { 
      href: '/orders/history',
      icon: HistoryIcon,
      label: 'Historique'
    },
    { 
      href: '/orders/settings',
      icon: SettingsIcon,
      label: 'Paramètres'
    }
  ];

  return (
    <div className="w-64 bg-white border-r h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Commandes</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => item.status && onTabChange(item.status)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                ${(item.status && item.status === activeTab) || (!item.status && pathname === item.href)
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${(item.status && item.status === activeTab) || (!item.status && pathname === item.href)
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 