'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { db } from '@/config/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { Service } from '@/types';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  editingService?: Service | null;
}

export default function AddServiceModal({ isOpen, onClose, editingService }: AddServiceModalProps) {
  const [service, setService] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'remote-desktop'
  });

  useEffect(() => {
    if (editingService) {
      setService({
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        category: editingService.category
      });
    } else {
      setService({
        name: '',
        description: '',
        price: 0,
        category: 'remote-desktop'
      });
    }
  }, [editingService]);

  const handleSubmit = async () => {
    try {
      if (editingService) {
        // Mise à jour
        await updateDoc(doc(db, 'services', editingService.id), {
          ...service,
          updatedAt: serverTimestamp()
        });
      } else {
        // Création
        await addDoc(collection(db, 'services'), {
          ...service,
          createdAt: serverTimestamp()
        });
      }
      onClose(true); // Indiquer qu'il faut rafraîchir
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <Dialog.Title className="text-lg font-semibold">
                  {editingService ? 'Modifier le service' : 'Nouveau service'}
                </Dialog.Title>
                <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du service
                  </label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => setService({ ...service, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => setService({ ...service, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix mensuel (€)
                  </label>
                  <input
                    type="number"
                    value={service.price}
                    onChange={(e) => setService({ ...service, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={service.category}
                    onChange={(e) => setService({ ...service, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="remote-desktop">Remote Desktop</option>
                    <option value="microsoft-365">Microsoft 365</option>
                    <option value="accounting">Comptabilité</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => onClose()}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
} 