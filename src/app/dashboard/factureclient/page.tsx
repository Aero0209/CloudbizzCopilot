'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { CompanyOwnerFactures } from '@/components/factures/CompanyOwnerFactures';
import { PartnerFactures } from '@/components/factures/PartnerFactures';

function FactureClientContent() {   
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'companyowner':
      return <CompanyOwnerFactures />;
    case 'partner':
      return <PartnerFactures />;
    default:
      return null;
  }
}

export default function FactureClientPage() {
  return (
    <RouteGuard allowedRoles={['companyowner', 'partner']}>
      <FactureClientContent />
    </RouteGuard>
  );
} 