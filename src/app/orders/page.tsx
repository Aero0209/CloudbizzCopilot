'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  RotateCw,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import OrderList from '@/components/orders/OrderList';
import OrderTabs from '@/components/orders/OrderTabs';
import { getStatusLabel } from '@/components/orders/utils';
import type { Order, UserProfile } from '@/types';
import MasterLayout from '@/components/dashboard/MasterLayout';
import OrdersNav from '@/components/orders/OrdersNav';
import OrderCard from '@/components/orders/OrderCard';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<Order['metadata']['status']>('pending');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0
  });

  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUserRole(userData.role);
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return null;
    }
  };

  const fetchOrders = async () => {
    if (!auth.currentUser) return;
    
    try {
      setIsLoadingOrders(true);
      const role = await fetchUserRole(auth.currentUser.uid);
      
      const ordersRef = collection(db, 'orders');
      let q;

      if (role === 'master') {
        q = query(
          ordersRef,
          orderBy('metadata.createdAt', 'desc')
        );
      } else {
        q = query(
          ordersRef,
          where('customer.userId', '==', auth.currentUser.uid),
          orderBy('metadata.createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        metadata: {
          ...doc.data().metadata,
          createdAt: doc.data().metadata.createdAt?.toDate(),
          updatedAt: doc.data().metadata.updatedAt?.toDate()
        }
      })) as Order[];
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchOrders();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Mettre à jour les compteurs quand les commandes changent
    setCounts({
      pending: orders.filter(o => o.metadata.status === 'pending').length,
      confirmed: orders.filter(o => o.metadata.status === 'confirmed').length,
      rejected: orders.filter(o => o.metadata.status === 'rejected').length
    });
  }, [orders]);

  const handleOrderStatusChange = () => {
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => order.metadata.status === activeTab);

  return (
    <MasterLayout>
      <div className="flex h-full bg-gray-50">
        <OrdersNav 
          counts={counts}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
                  <p className="mt-2 text-sm text-gray-500">
                    Vue d'ensemble et gestion de toutes les commandes de la plateforme
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fetchOrders()}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <RotateCw className="h-5 w-5" />
                    Actualiser
                  </button>
                </div>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Chargement des commandes...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusChange={handleOrderStatusChange}
                  />
                ))}
                {filteredOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
                    <Inbox className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Aucune commande {getStatusLabel(activeTab).toLowerCase()}
                    </h3>
                    <p className="text-gray-500">
                      Les nouvelles commandes apparaîtront ici
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MasterLayout>
  );
} 