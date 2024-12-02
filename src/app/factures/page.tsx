'use client';

import { useAuth } from '@/hooks/useAuth';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { useModulesContext } from '@/providers/ModulesProvider';
import { ModuleDisabledPage } from '@/components/ModuleDisabledPage';
import { CompanyOwnerInvoices } from '@/components/invoices/CompanyOwnerInvoices';
import { AdminInvoices } from '@/components/invoices/AdminInvoices';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { isModuleEnabled } = useModulesContext();

  if (!isModuleEnabled('billing')) {
    return <ModuleDisabledPage moduleKey="billing" />;
  }

  return (
    <MasterLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        

        {user?.role === 'companyowner' ? (
          <CompanyOwnerInvoices />
        ) : (
          <AdminInvoices />
        )}
      </div>
    </MasterLayout>
  );
} 