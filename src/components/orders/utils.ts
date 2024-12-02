import { Order } from '@/types';

export const getStatusColor = (status: Order['metadata']['status']) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'confirmed':
      return 'text-green-600 bg-green-50';
    case 'rejected':
      return 'text-red-600 bg-red-50';
  }
};

export const getStatusLabel = (status: Order['metadata']['status']) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'confirmed':
      return 'Confirmée';
    case 'rejected':
      return 'Refusée';
  }
}; 