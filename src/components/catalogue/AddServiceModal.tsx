'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Category } from '@/types/catalogue';

interface AddServiceModalProps {
  categories: Category[];
  onClose: () => void;
  onAdd: (service: any) => Promise<void>;
}

const AddServiceModal = ({ categories, onClose, onAdd }: AddServiceModalProps) => {
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    category: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ajouter un service</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du service
            </label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Nom du service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Description du service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix mensuel (€)
            </label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={newService.category}
              onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={() => onAdd(newService)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal; 