'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { generateInvoicePDF, defaultTemplate } from '@/lib/generatePDF';
import { Loader2 } from 'lucide-react';
import { Invoice } from '@/types';

export default function InvoicePDFPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePDF = async () => {
      try {
        const docRef = doc(db, 'invoices', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const invoice = {
            id: params.id,
            createdAt: docSnap.data().createdAt?.toDate(),
            dueDate: docSnap.data().dueDate?.toDate(),
            number: docSnap.data().number,
            companyId: docSnap.data().companyId,
            companyName: docSnap.data().companyName,
            totalAmount: docSnap.data().totalAmount,
            status: docSnap.data().status,
            services: docSnap.data().services,
            customer: docSnap.data().customer
          };

          const pdfDoc = await generateInvoicePDF(invoice as Invoice, defaultTemplate);
          pdfDoc.save(`facture-${invoice.number}.pdf`);
          window.close();
        }
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePDF();
  }, [params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2 text-gray-500">Génération du PDF...</p>
      </div>
    </div>
  );
} 