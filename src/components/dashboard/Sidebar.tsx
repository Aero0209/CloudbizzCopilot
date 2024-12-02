'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useModulesContext } from '@/providers/ModulesProvider';
import {
  LayoutGrid,
  Users,
  Package,
  FileText,
  Settings,
  Building2,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isModuleEnabled } = useModulesContext();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'master':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
          { href: '/clients', label: 'Clients', icon: Building2 },
          { href: '/catalogue', label: 'Catalogue', icon: Package },
          ...(isModuleEnabled('billing') ? [
            { href: '/factures', label: 'Factures', icon: FileText }
          ] : []),
          { href: '/services/pending', label: 'Services en attente', icon: Clock },
          { href: '/gestion', label: 'Gestion', icon: Settings }

        ];
      case 'partner':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
          { href: '/clients', label: 'Clients', icon: Building2 },
          { href: '/commissions', label: 'Commissions', icon: FileText },
          ...(isModuleEnabled('billing') ? [
            { href: '/factures', label: 'Factures', icon: FileText }
          ] : []),
          { href: '/leads', label: 'Leads', icon: Users }
        ];
      case 'companyowner':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
          { href: '/ma-societe', label: 'Ma société', icon: Building2 },
          ...(isModuleEnabled('billing') ? [
            { href: '/factures', label: 'Factures', icon: FileText }
          ] : []),
          { href: '/support', label: 'Support', icon: HelpCircle }
        ];
      default:
        return [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
          { href: '/support', label: 'Support', icon: HelpCircle }
        ];
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Cloudbizz
        </Link>
      </div>
      <nav className="p-4 space-y-1">
        {getNavigationItems().map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 