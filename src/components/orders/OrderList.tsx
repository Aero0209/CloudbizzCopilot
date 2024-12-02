import React from 'react';
import { Order } from '@/types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  activeTab: Order['metadata']['status'];
  getStatusLabel: (status: Order['metadata']['status']) => string;
  onStatusChange: () => void;
}

export default function OrderList({ orders, activeTab, getStatusLabel, onStatusChange }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune commande {getStatusLabel(activeTab).toLowerCase()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard 
          key={order.id} 
          order={order} 
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
} 