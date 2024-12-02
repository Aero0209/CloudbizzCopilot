'use client';

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface PriceManagementModalProps {
  serviceId: string;
  currentPrice: number;
  onClose: () => void;
  onUpdate: (newPrice: number) => Promise<void>;
}

const PriceManagementModal = ({
  serviceId,
  currentPrice,
  onClose,
  onUpdate
}: PriceManagementModalProps) => {
  const [price, setPrice] = useState(currentPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mise à jour du prix dans Firestore
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        price: price,
        updatedAt: new Date()
      });

      // Appeler le callback onUpdate
      await onUpdate(price);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du prix:', err);
      setError('Une erreur est survenue lors de la mise à jour du prix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Gestion des prix</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix mensuel (€)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="block w-full pr-12 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-4 py-2"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
            </div>
          </div>

          {/* Affichage des changements */}
          {price !== currentPrice && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                Ancien prix: {currentPrice.toFixed(2)}€
              </span>
              <span className="text-gray-400">→</span>
              <span className={`font-medium ${
                price > currentPrice ? 'text-green-600' : 'text-red-600'
              }`}>
                Nouveau prix: {price.toFixed(2)}€
              </span>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || price === currentPrice}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${loading || price === currentPrice
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            <Save className="h-4 w-4" />
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceManagementModal; 