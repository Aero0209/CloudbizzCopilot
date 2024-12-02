'use client';

import React from 'react';
import { FileText, Download, Clock, CreditCard } from 'lucide-react';
import type { Company, Invoice } from '@/types';

interface ClientBillingProps {
  company: Company;
  invoices?: Invoice[];
}

export default function ClientBilling({ company, invoices = [] }: ClientBillingProps) {
  if (!company) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Facturation</h2>
      {/* Contenu à implémenter */}
    </div>
  );
} 