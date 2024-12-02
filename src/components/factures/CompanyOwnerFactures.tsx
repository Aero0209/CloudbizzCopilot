'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { FileText, Download, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { Invoice } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function CompanyOwnerFactures() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user?.companyId) return;
      
      try {
        const q = query(
          collection(db, 'invoices'),
          where('companyId', '==', user.companyId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const invoicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          dueDate: doc.data().dueDate?.toDate()
        })) as Invoice[];
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [user?.companyId]);

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    overdue: invoices.filter(inv => 
      inv.status === 'pending' && inv.dueDate && new Date(inv.dueDate) < new Date()
    ).length
  };

  return (
    <MasterLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
        <p className="mt-2 text-gray-500">Consultez et gérez vos factures</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Stats Cards */}
          {/* ... Copier les stats cards de CompanyOwnerInvoices ... */}
        </div>

        {/* Liste des factures */}
        {/* ... Copier la liste des factures de CompanyOwnerInvoices ... */}
      </div>
    </MasterLayout>
  );
} 