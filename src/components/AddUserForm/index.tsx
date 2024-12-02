import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Search, Mail, Calendar, Building2 } from 'lucide-react';
import { auth } from '@/config/firebase';
import type { CompanyUser } from '@/types';

interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: { firstName: string; lastName: string; email: string }) => void;
  existingUsers?: CompanyUser[]; // Liste des utilisateurs existants
}

export default function AddUserForm({ isOpen, onClose, onSubmit, existingUsers = [] }: AddUserFormProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState([{ firstName: '', lastName: '', email: '' }]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Vérifier si l'utilisateur est propriétaire
    const userDetails = existingUsers.find(u => u.email === currentUser.email);
    setIsOwner(userDetails?.role === 'owner');
  }, [existingUsers]);

  const filteredUsers = existingUsers.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title className="text-lg font-semibold">
                    Gestion des Utilisateurs
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {isOwner && (
                    <>
                      {/* Liste des utilisateurs existants */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Utilisateurs actuels</h3>
                          <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4" />
                            Nouvel utilisateur
                          </button>
                        </div>

                        {/* Barre de recherche */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Liste des utilisateurs */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="max-h-96 overflow-y-auto">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.userId}
                                className="p-4 hover:bg-gray-50 border-b last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-lg font-medium text-blue-600">
                                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {user.firstName && user.lastName 
                                          ? `${user.firstName} ${user.lastName}`
                                          : user.email
                                        }
                                      </div>
                                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Mail className="h-4 w-4" />
                                          {user.email}
                                        </span>
                                        {user.department && (
                                          <span className="flex items-center gap-1">
                                            <Building2 className="h-4 w-4" />
                                            {user.department}
                                          </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          Depuis {new Date(user.joinedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'owner'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.role === 'owner' ? 'Propriétaire' : 'Employé'}
                                  </span>
                                </div>
                              </div>
                            ))}

                            {filteredUsers.length === 0 && (
                              <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Formulaire d'ajout */}
                      {showAddForm && (
                        <div className="mt-8 pt-8 border-t">
                          <h3 className="text-lg font-medium mb-4">Ajouter un nouvel utilisateur</h3>
                          {/* ... Formulaire existant ... */}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 