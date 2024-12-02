'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  CreditCard,
  Loader2,
  Eye,
  TrendingUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { InvoiceDetails } from './InvoiceDetails';
import { GenerationModal } from './GenerationModal';
import { generateInvoicePDF, defaultTemplate } from '@/lib/generatePDF';
import { sendEmail } from '@/lib/email';
import type { Invoice } from './types';
import emailjs from '@emailjs/browser';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function AdminInvoices() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'invoices'),
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

  useEffect(() => {
    loadInvoices();
  }, []);

  // Calcul des statistiques basiques
  const basicStats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    overdue: invoices.filter(inv => 
      inv.status === 'pending' && inv.dueDate && new Date(inv.dueDate) < new Date()
    ).length
  };

  // Calcul des statistiques à partir des données réelles
  const calculateStats = () => {
    if (!invoices.length) return {
      monthlyTrend: 0,
      averageAmount: 0,
      paymentRate: 0,
      averagePaymentDelay: 0,
      monthlyData: {
        labels: [],
        amounts: []
      }
    };

    // Calcul du montant moyen
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const averageAmount = totalAmount / invoices.length;

    // Taux de paiement
    const paymentRate = (invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100;

    // Délai moyen de paiement (en jours)
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.createdAt && inv.dueDate);
    const averagePaymentDelay = paidInvoices.reduce((sum, inv) => {
      const days = Math.floor((inv.dueDate!.getTime() - inv.createdAt!.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / (paidInvoices.length || 1);

    // Données mensuelles pour le graphique
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    const monthlyData = {
      labels: last6Months.map(date => format(date, 'MMM', { locale: fr })),
      amounts: last6Months.map(date => {
        return invoices
          .filter(inv => inv.createdAt?.getMonth() === date.getMonth() && 
                        inv.createdAt?.getFullYear() === date.getFullYear())
          .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      })
    };

    // Calcul de la tendance (comparaison avec le mois précédent)
    const lastMonth = monthlyData.amounts[monthlyData.amounts.length - 1];
    const previousMonth = monthlyData.amounts[monthlyData.amounts.length - 2];
    const monthlyTrend = previousMonth ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      monthlyTrend,
      averageAmount,
      paymentRate,
      averagePaymentDelay,
      monthlyData
    };
  };

  const stats = calculateStats();

  const handleSend = async (invoice: Invoice) => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer cette facture ?')) return;
    
    try {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);

      const pdfDoc = await generateInvoicePDF(invoice, defaultTemplate);
      const pdfBase64 = pdfDoc.output('datauristring');

      const emailParams = {
        to: 'noah180305@gmail.com', // À remplacer par l'email du client
        subject: `Facture ${invoice.number}`,
        text: `Veuillez trouver ci-joint votre facture ${invoice.number}.`,
        attachments: [{
          filename: `facture-${invoice.number}.pdf`,
          content: pdfBase64.split('base64,')[1],
          encoding: 'base64'
        }]
      };

      await sendEmail(emailParams);

      const invoiceRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invoiceRef, {
        status: 'sent'
      });
      
      setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'sent' } : i));
      
      alert('La facture a été envoyée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la facture:', error);
      alert('Une erreur est survenue lors de l\'envoi de la facture');
    }
  };

  const handleSendAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer toutes les factures en attente ?')) return;
    
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    
    for (const invoice of pendingInvoices) {
      try {
        await handleSend(invoice);
      } catch (error) {
        console.error(`Erreur lors de l'envoi de la facture ${invoice.number}:`, error);
      }
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    
    try {
      const invoiceRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invoiceRef, {
        status: 'cancelled'
      });
      
      setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'cancelled' } : i));
      setSelectedInvoice(null);
      
      alert('La facture a été supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      alert('Une erreur est survenue lors de la suppression de la facture');
    }
  };

  // Données pour le graphique mises à jour
  const chartData = {
    labels: stats.monthlyData.labels,
    datasets: [
      {
        label: 'Montant des factures (€)',
        data: stats.monthlyData.amounts,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        {/* En-tête avec fond dégradé */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 -mx-8 -mt-8 px-8 pt-8 pb-24">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">Factures</h1>
                <p className="mt-2 text-blue-100">
                  Gérez vos factures et paiements
                </p>
              </div>
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white">
                  Stats des factures
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white">
                  Liste & Génération
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Motif décoratif */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Contenu des onglets */}
        <TabsContent value="overview">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50/50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total factures</p>
                  <p className="text-2xl font-semibold">{basicStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Factures payées</p>
                  <p className="text-2xl font-semibold">{basicStats.paid}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50/50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-2xl font-semibold">{basicStats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">En retard</p>
                  <p className="text-2xl font-semibold">{basicStats.overdue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique et Statistiques */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique principal */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Évolution des factures</h2>
                  <p className="text-sm text-gray-500">Montant total par mois</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Statistiques supplémentaires */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Statistiques</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Montant moyen</span>
                    <span className="font-medium">{stats.averageAmount.toFixed(2)}€</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Taux de paiement</span>
                    <span className="font-medium">{stats.paymentRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-green-600 rounded-full" 
                      style={{ width: `${stats.paymentRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Délai moyen de paiement</span>
                    <span className="font-medium">{Math.round(stats.averagePaymentDelay)} jours</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-orange-600 rounded-full" 
                      style={{ width: `${Math.min((stats.averagePaymentDelay / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Liste des factures</h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleSendAll}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                  Envoyer toutes les factures
                </button>
                <button 
                  onClick={() => setShowGenerationModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Clock className="h-4 w-4" />
                  Génération automatique
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Nouvelle facture
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-gray-500">Chargement des factures...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune facture pour le moment
              </div>
            ) : (
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
                      <tr 
                        key={invoice.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(invoice);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
                                  handleDelete(invoice);
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de génération automatique */}
      {showGenerationModal && (
        <GenerationModal 
          onClose={() => {
            setShowGenerationModal(false);
            loadInvoices();
          }} 
        />
      )}

      {/* Modal de détails */}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSend={handleSend}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
} 