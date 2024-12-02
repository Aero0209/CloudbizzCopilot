'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  X, 
  Download,
  Send,
  Trash2,
  Building2,
  Calendar,
  CreditCard,
  Users,
  MapPin,
  Mail,
  FileText,
  Loader2
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  totalAmount: number | null;
  status: 'pending' | 'paid' | 'cancelled' | 'sent';
  dueDate: Date | null;
  createdAt: Date | null;
  services: Array<{
    name: string;
    price: number;
    users: Array<{
      userId: string;
      email: string;
    }>;
  }>;
  customer: {
    companyName: string;
    vatNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
}

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  onSend: (invoice: Invoice) => Promise<void>;
  onDelete: (invoice: Invoice) => Promise<void>;
}

export function InvoiceDetails({ invoice, onClose, onSend, onDelete }: InvoiceDetailsProps) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    try {
      setSending(true);
      await onSend(invoice);
    } finally {
      setSending(false);
    }
  };

  // Vérifier si les informations du client sont disponibles
  const hasCustomerInfo = invoice.customer && invoice.customer.companyName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl">
        {/* En-tête */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Facture {invoice.number}</h3>
            <p className="text-sm text-gray-500">
              Créée le {invoice.createdAt ? format(invoice.createdAt, 'dd MMMM yyyy', { locale: fr }) : '-'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-6">
            {/* Informations client */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Client</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {hasCustomerInfo ? (
                    <>
                      <h4 className="font-medium">{invoice.customer.companyName}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {invoice.customer.vatNumber}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {invoice.customer.address}<br />
                        {invoice.customer.postalCode} {invoice.customer.city}<br />
                        {invoice.customer.country}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {invoice.customer.email}
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium">{invoice.companyName || `Client ${invoice.companyId}`}</h4>
                      <p className="text-sm text-gray-500">
                        Informations client non disponibles
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Informations facture */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Détails facture</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Date d'échéance</span>
                    <span className="font-medium">
                      {invoice.dueDate ? format(invoice.dueDate, 'dd MMMM yyyy', { locale: fr }) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Montant total</span>
                    <span className="font-medium text-lg">
                      {invoice.totalAmount?.toFixed(2) || '0.00'}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Statut</span>
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Services facturés
            </h4>
            <div className="space-y-4">
              {invoice.services.map((service, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{service.name}</h5>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{service.users.length} utilisateur(s)</span>
                      </div>
                    </div>
                    <p className="font-medium">{service.price.toFixed(2)}€</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
          <button
            onClick={() => onDelete(invoice)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Download className="h-4 w-4" />
              Télécharger
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}