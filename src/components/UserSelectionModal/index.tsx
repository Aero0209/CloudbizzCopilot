import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Search, Plus, Package } from 'lucide-react';
import { auth } from '@/config/firebase';
import type { CompanyUser } from '@/types';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: CompanyUser[];
  onSubmit: (selectedUsers: string[]) => void;
}

export default function UserSelectionModal({ 
  isOpen, 
  onClose, 
  title,
  users,
  onSubmit 
}: UserSelectionModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<CompanyUser[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Vérifier si l'utilisateur est propriétaire
    const userDetails = users.find(u => u.email === currentUser.email);
    setIsOwner(userDetails?.role === 'owner');

    // Si ce n'est pas le propriétaire, sélectionner uniquement son propre ID
    if (userDetails && userDetails.role !== 'owner') {
      setSelectedUsers([userDetails.userId]);
    }
  }, [users]);

  useEffect(() => {
    // Filtrer les utilisateurs selon la recherche
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSubmit = () => {
    onSubmit(selectedUsers);
    onClose();
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
              <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {isOwner ? (
                    <>
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
                            <label
                              key={user.userId}
                              className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                                selectedUsers.includes(user.userId) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.userId)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers([...selectedUsers, user.userId]);
                                    } else {
                                      setSelectedUsers(selectedUsers.filter(id => id !== user.userId));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.email
                                      }
                                    </span>
                                    {user.role === 'owner' && (
                                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        Propriétaire
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                    {user.department && ` • ${user.department}`}
                                  </div>
                                </div>
                              </div>

                              {user.servicesCount && user.servicesCount.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {user.servicesCount.total} service(s)
                                  </span>
                                </div>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUsers(filteredUsers.map(u => u.userId))}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Tout sélectionner
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUsers([])}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Tout désélectionner
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      Vous ne pouvez sélectionner que votre propre compte.
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={selectedUsers.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Confirmer
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