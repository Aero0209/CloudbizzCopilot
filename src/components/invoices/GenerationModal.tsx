'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Loader2 } from 'lucide-react';
import type { CompanyService } from '@/types';

interface GenerationModalProps {
  onClose: () => void;
}

export function GenerationModal({ onClose }: GenerationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
    console.log(message);
  };

  const generateInvoices = async () => {
    setLoading(true);
    setError(null);
    setLog([]);
    
    try {
      // 1. Récupérer tous les services actifs
      addLog("Récupération des services actifs...");
      const servicesQuery = query(
        collection(db, 'userServices'),
        where('status', '==', 'active')
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      const services = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CompanyService[];

      addLog(`${services.length} services trouvés`);

      if (services.length === 0) {
        setError("Aucun service actif trouvé");
        return;
      }

      // 2. Grouper les services par entreprise
      const servicesByCompany = services.reduce((acc, service) => {
        if (!service.companyId) {
          addLog(`Service ${service.id} sans companyId ignoré`);
          return acc;
        }
        if (!acc[service.companyId]) {
          acc[service.companyId] = [];
        }
        acc[service.companyId].push(service);
        return acc;
      }, {} as Record<string, CompanyService[]>);

      addLog(`Services groupés pour ${Object.keys(servicesByCompany).length} entreprises`);

      // 3. Créer une facture pour chaque entreprise
      for (const [companyId, companyServices] of Object.entries(servicesByCompany)) {
        addLog(`Récupération des informations de l'entreprise ${companyId}`);
        
        // Récupérer les informations de l'entreprise
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (!companyDoc.exists()) {
          addLog(`Entreprise ${companyId} non trouvée, facture ignorée`);
          continue;
        }

        const companyData = companyDoc.data();
        
        const totalAmount = companyServices.reduce((sum, service) => {
          const userCount = service.users?.length || 1;
          const monthlyPrice = service.monthlyPrice || 0;
          return sum + (monthlyPrice * userCount);
        }, 0);

        const invoiceData = {
          companyId,
          companyName: companyData.name,
          services: companyServices.map(s => ({
            name: s.name || 'Service sans nom',
            price: s.monthlyPrice || 0,
            users: s.users || [],
          })),
          totalAmount,
          status: 'pending' as const,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          number: `INV-${Date.now()}-${companyId.slice(0, 4)}`,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          customer: {
            companyName: companyData.name,
            vatNumber: companyData.vatNumber,
            address: companyData.address,
            city: companyData.city,
            postalCode: companyData.postalCode,
            country: companyData.country || 'France',
            email: companyData.email
          }
        };

        const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
        addLog(`Facture créée avec l'ID: ${docRef.id}`);
      }

      addLog("Génération terminée avec succès");
      setTimeout(onClose, 1500); // Ferme après 1.5s pour voir le message de succès

    } catch (err) {
      console.error('Erreur lors de la génération des factures:', err);
      setError("Une erreur s'est produite lors de la génération des factures");
      addLog(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Génération automatique</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-500 mb-6">
          Cette action va générer les factures pour tous les services actifs du mois en cours.
          Voulez-vous continuer ?
        </p>

        {log.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            {log.map((message, i) => (
              <div key={i} className="text-sm text-gray-600 py-0.5">
                {message}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            onClick={generateInvoices}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              'Générer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 