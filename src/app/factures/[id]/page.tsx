'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails';
import { Loader2 } from 'lucide-react';

export default function InvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const docRef = doc(db, 'invoices', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setInvoice({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            dueDate: docSnap.data().dueDate?.toDate()
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la facture:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [params.id]);

  if (loading) {
    return (
      <MasterLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-500">Chargement de la facture...</p>
          </div>
        </div>
      </MasterLayout>
    );
  }

  if (!invoice) {
    return (
      <MasterLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Facture introuvable</h1>
            <p className="mt-2 text-gray-500">La facture demandée n'existe pas.</p>
          </div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="p-8">
        <InvoiceDetails
          invoice={invoice}
          onClose={() => window.history.back()}
          onSend={async () => {}}
          onDelete={async () => {}}
        />
      </div>
    </MasterLayout>
  );
} 