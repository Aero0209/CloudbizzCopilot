'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import type { Invoice } from './types';
import { InvoiceDetails } from './InvoiceDetails';

export function CompanyOwnerInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total factures</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Factures payées</p>
              <p className="text-2xl font-semibold">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En retard</p>
              <p className="text-2xl font-semibold">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Mes factures</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Numéro</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{invoice.number}</td>
                    <td className="px-4 py-3 text-sm">
                      {invoice.createdAt ? format(invoice.createdAt, 'dd MMMM yyyy', { locale: fr }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {invoice.totalAmount ? `${invoice.totalAmount.toFixed(2)}€` : '0.00€'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        ${invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {invoice.status === 'paid' ? 'Payée' : ''}
                        {invoice.status === 'pending' ? 'En attente' : ''}
                        {invoice.status === 'cancelled' ? 'Annulée' : ''}
                        {invoice.status === 'sent' ? 'Envoyée' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/factures/${invoice.id}/pdf`, '_blank')}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSend={() => Promise.resolve()}
          onDelete={() => Promise.resolve()}
        />
      )}
    </div>
  );
} 