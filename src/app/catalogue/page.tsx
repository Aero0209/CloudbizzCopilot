'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Package, Plus, Edit, Trash2, FolderPlus, AlertTriangle } from 'lucide-react';
import MasterLayout from '@/components/dashboard/MasterLayout';

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  slug: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export default function CataloguePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'folder',
    slug: ''
  });
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [selectedNewCategory, setSelectedNewCategory] = useState<string>('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    price: 0,
    description: '',
    category: ''
  });

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Charger les catégories
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        // Charger les services
        const servicesSnap = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        setServices(servicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fonction pour générer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ùû]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[ïî]/g, 'i')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Mettre à jour le nom et générer automatiquement le slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewCategory({
      ...newCategory,
      name,
      slug: generateSlug(name)
    });
  };

  // Ajouter une catégorie
  const handleAddCategory = async () => {
    try {
      const categoryData = {
        ...newCategory,
        order: categories.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'categories'), categoryData);

      const newCategoryWithId: Category = {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCategories([...categories, newCategoryWithId]);
      setNewCategory({ name: '', description: '', icon: 'folder', slug: '' });
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    setCategoryToDelete(category);
    setSelectedNewCategory('');
    setIsDeletingCategory(true);
  };

  const confirmDeleteCategory = async (moveServices: boolean) => {
    try {
      if (!categoryToDelete) return;

      // Récupérer les services de cette catégorie
      const categoryServices = services.filter(s => s.category === categoryToDelete.slug);

      if (moveServices && selectedNewCategory) {
        // Déplacer les services vers la nouvelle catégorie
        for (const service of categoryServices) {
          await updateDoc(doc(db, 'services', service.id), {
            category: selectedNewCategory
          });
        }

        // Mettre à jour l'état local des services
        setServices(services.map(service => 
          service.category === categoryToDelete.slug 
            ? { ...service, category: selectedNewCategory }
            : service
        ));
      } else if (!moveServices) {
        // Supprimer les services de la catégorie
        for (const service of categoryServices) {
          await deleteDoc(doc(db, 'services', service.id));
        }

        // Mettre à jour l'état local des services
        setServices(services.filter(s => s.category !== categoryToDelete.slug));
      }

      // Supprimer la catégorie
      await deleteDoc(doc(db, 'categories', categoryToDelete.id));
      
      // Mettre à jour l'état local des catégories
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      
      setIsDeletingCategory(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
    }
  };

  const handleAddService = async () => {
    try {
      const serviceData = {
        ...newService,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'services'), serviceData);
      const newServiceWithId = {
        id: docRef.id,
        ...serviceData
      };

      setServices([...services, newServiceWithId]);
      setNewService({ name: '', price: 0, description: '', category: '' });
      setIsAddingService(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du service:', error);
    }
  };

  const handleEditService = async (service: Service) => {
    setServiceToEdit(service);
    setNewService({
      name: service.name,
      price: service.price,
      description: service.description,
      category: service.category
    });
    setIsEditingService(true);
  };

  const confirmEditService = async () => {
    try {
      if (!serviceToEdit) return;

      await updateDoc(doc(db, 'services', serviceToEdit.id), {
        name: newService.name,
        price: newService.price,
        description: newService.description,
        category: newService.category,
        updatedAt: new Date()
      });

      setServices(services.map(s => 
        s.id === serviceToEdit.id 
          ? { ...s, ...newService }
          : s
      ));

      setIsEditingService(false);
      setServiceToEdit(null);
      setNewService({ name: '', price: 0, description: '', category: '' });
    } catch (error) {
      console.error('Erreur lors de la modification du service:', error);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`)) {
      try {
        await deleteDoc(doc(db, 'services', service.id));
        setServices(services.filter(s => s.id !== service.id));
      } catch (error) {
        console.error('Erreur lors de la suppression du service:', error);
      }
    }
  };

  return (
    <MasterLayout>
      <div className="min-h-screen bg-gray-50 relative pb-8">
        <div className="bg-[#2563eb] h-[150px]">
          <div className="max-w-7xl mx-auto px-8 pt-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Catalogue</h1>
                <p className="mt-2 text-blue-100">Gérez vos services et catégories</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  Nouvelle catégorie
                </button>
                <button
                  onClick={() => setIsAddingService(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau service
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-[180px] inset-x-0">
          <div className="max-w-7xl mx-auto px-8">
            <div className="space-y-6">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                          <Package className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">{category.name}</h2>
                          <p className="text-gray-500 mt-1">{category.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Supprimer la catégorie"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {services
                        .filter(service => service.category === category.slug)
                        .map((service) => (
                          <ServiceCard 
                            key={service.id} 
                            service={service}
                            onEdit={() => handleEditService(service)}
                            onDelete={() => handleDeleteService(service)}
                          />
                        ))}
                      
                      {/* Message si aucun service */}
                      {services.filter(s => s.category === category.slug).length === 0 && (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Aucun service dans cette catégorie</p>
                          <button
                            onClick={() => {
                              setNewService(prev => ({ ...prev, category: category.slug }));
                              setIsAddingService(true);
                            }}
                            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ajouter un service
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Message si aucune catégorie */}
              {categories.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune catégorie</h3>
                  <p className="text-gray-500 mb-6">Commencez par créer une catégorie pour organiser vos services</p>
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer une catégorie
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de catégorie */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouvelle catégorie</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Nom de la catégorie"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Slug: {newCategory.slug}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Description de la catégorie"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeletingCategory && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold">Supprimer la catégorie</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              La catégorie "{categoryToDelete.name}" contient {
                services.filter(s => s.category === categoryToDelete.slug).length
              } service(s). Que souhaitez-vous faire ?
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="move"
                  name="deleteAction"
                  value="move"
                  checked={selectedNewCategory !== ''}
                  onChange={() => setSelectedNewCategory(
                    categories.find(c => c.id !== categoryToDelete.id)?.slug || ''
                  )}
                  className="w-4 h-4"
                />
                <label htmlFor="move" className="text-sm">
                  Déplacer les services vers une autre catégorie
                </label>
              </div>

              {selectedNewCategory && (
                <select
                  value={selectedNewCategory}
                  onChange={(e) => setSelectedNewCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg mt-2"
                >
                  {categories
                    .filter(c => c.id !== categoryToDelete.id)
                    .map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))
                  }
                </select>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="delete"
                  name="deleteAction"
                  value="delete"
                  checked={selectedNewCategory === ''}
                  onChange={() => setSelectedNewCategory('')}
                  className="w-4 h-4"
                />
                <label htmlFor="delete" className="text-sm">
                  Supprimer tous les services de cette catégorie
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsDeletingCategory(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmDeleteCategory(selectedNewCategory !== '')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {(isAddingService || isEditingService) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditingService ? 'Modifier le service' : 'Nouveau service'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
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
                  Prix
                </label>
                <input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Prix du service"
                  step="0.01"
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
                  placeholder="Description du service"
                  rows={3}
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
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsAddingService(false);
                    setIsEditingService(false);
                    setServiceToEdit(null);
                    setNewService({ name: '', price: 0, description: '', category: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={isEditingService ? confirmEditService : handleAddService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditingService ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MasterLayout>
  );
}

// Composant ServiceCard
function ServiceCard({ 
  service, 
  onEdit, 
  onDelete 
}: { 
  service: Service; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  return (
    <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/0 to-blue-400/0 group-hover:from-blue-50/50 group-hover:via-blue-50/50 group-hover:to-blue-100/50 transition-all duration-500" />
      
      <div className="relative p-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-300">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600">
                {service.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <span className="font-semibold text-lg text-gray-900">
            {service.price.toFixed(2)} €
            <span className="text-sm text-gray-500 font-normal">/mois</span>
          </span>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 