'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MasterDashboard } from '@/components/dashboard';
import { CompanyOwnerDashboard } from '@/components/dashboard';
import { EmployeeDashboard } from '@/components/dashboard';
import { PartnerDashboard } from '@/components/dashboard';

function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'master':
      return <MasterDashboard />;
    case 'companyowner':
      return <CompanyOwnerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    case 'partner':
      return <PartnerDashboard />;
    default:
      return <EmployeeDashboard />;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return null;

  if (!user) {
    router.push('/login');
    return null;
  }

  return <DashboardContent />;
} 