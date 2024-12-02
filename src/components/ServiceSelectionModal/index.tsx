'use client';

import React, { useState, useEffect } from 'react';
import { Service, Company } from '@/types';
import { services } from '@/data/services';
import { 
  ComputerDesktopIcon, 
  WindowIcon, 
  CalculatorIcon,
  CheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { auth, db } from '@/config/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useServiceValidation } from '@/hooks/useServiceValidation';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'services' | 'users' | 'company' | 'payment' | 'summary';
type Category = 'remote-desktop' | 'microsoft-365' | 'accounting';
type PaymentMethod = 'bank-transfer' | 'sepa' | 'credit-card';
type SubscriptionDuration = 12 | 24 | 36;

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
}

interface CompanyDetail {
  id?: string;
  name: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
}

interface ServiceSelection {
  service: Service;
  duration: SubscriptionDuration | null;
}

interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  status: 'active' | 'inactive' | 'pending';
}

export default function ServiceSelectionModal({ 
  isOpen, 
  onClose 
}: ServiceSelectionModalProps): React.ReactElement | null {
  const [currentStep, setCurrentStep] = useState<Step>('services');
  const [selectedCategory, setSelectedCategory] = useState<Category>('remote-desktop');
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [users, setUsers] = useState<UserDetail[]>([{ firstName: '', lastName: '', email: '' }]);
  const [company, setCompany] = useState<CompanyDetail>({
    name: '',
    email: '',
    phone: '',
    vatNumber: '',
    address: '',
    postalCode: '',
    city: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank-transfer');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [isPatron, setIsPatron] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);
  const [existingCompany, setExistingCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { requireValidation } = useServiceValidation();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!auth.currentUser) {
        console.log('No user logged in');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        
        // Vérifie si l'utilisateur est un patron (companyowner) ou un client
        setIsPatron(userData?.role === 'companyowner' || userData?.role === 'client');

        if (userData?.role === 'companyowner' || userData?.role === 'client') {
          // Charger les informations de l'entreprise
          const companyId = userData.companyId;
          if (companyId) {
            const companyDoc = await getDoc(doc(db, 'companies', companyId));
            if (companyDoc.exists()) {
              const companyData = companyDoc.data() as Company;
              setCompany({
                id: companyDoc.id,
                name: companyData.name,
                email: companyData.email,
                phone: companyData.phone,
                vatNumber: companyData.vatNumber,
                address: companyData.address,
                postalCode: companyData.postalCode,
                city: companyData.city,
              });
            }
            // Charger les utilisateurs de l'entreprise
            await fetchCompanyUsers(companyId);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [auth.currentUser]);

  const fetchCompanyUsers = async (companyId: string) => {
    console.log('Fetching users for company:', companyId);
    setIsLoadingUsers(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      
      const users: CompanyUser[] = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as CompanyUser);
      });

      console.log('Fetched users:', users);
      setCompanyUsers(users);
    } catch (error) {
      console.error('Error fetching company users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getInitials = (user: CompanyUser): string => {
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial) || '??';
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const renderCompanyUsersList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Utilisateurs de l'entreprise</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sélectionnez les utilisateurs pour lesquels vous souhaitez attribuer des services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedUsers.length} utilisateur{selectedUsers.length !== 1 ? 's' : ''} sélectionné{selectedUsers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {isLoadingUsers ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelection(user.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all cursor-pointer
                ${selectedUsers.includes(user.id)
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              {selectedUsers.includes(user.id) && (
                <div className="absolute top-4 right-4">
                  <CheckIcon className="h-5 w-5 text-blue-600" />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-lg">
                    {getInitials(user)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <span className={`
                      px-2 py-0.5 text-xs font-medium rounded-full
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}
                    `}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ajouté le {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  const categories = [
    { 
      id: 'remote-desktop', 
      label: 'Remote Desktop', 
      icon: ComputerDesktopIcon 
    },
    { 
      id: 'microsoft-365', 
      label: 'Microsoft 365', 
      icon: WindowIcon 
    },
    { 
      id: 'accounting', 
      label: 'Comptabilité', 
      icon: CalculatorIcon 
    },
  ] as const;

  const getDiscountPercentage = (duration: SubscriptionDuration | null): number => {
    if (!duration) return 0;
    switch (duration) {
      case 12:
        return 0.10; // 10%
      case 24:
        return 0.15; // 15%
      case 36:
        return 0.20; // 20%
      default:
        return 0;
    }
  };

  const handleServiceSelection = (service: Service, duration: SubscriptionDuration = 12) => {
    setSelectedServices(prev => {
      if (service.category === 'remote-desktop') {
        const withoutRemoteDesktop = prev.filter(s => s.service.category !== 'remote-desktop');
        if (!prev.some(s => s.service.id === service.id)) {
          return [...withoutRemoteDesktop, { service, duration }];
        }
        return withoutRemoteDesktop;
      } else {
        const existingIndex = prev.findIndex(s => s.service.id === service.id);
        if (existingIndex >= 0) {
          const newServices = [...prev];
          newServices[existingIndex] = { ...newServices[existingIndex], duration };
          return newServices;
        }
        return [...prev, { service, duration }];
      }
    });
  };

  const calculatePrices = () => {
    const calculations = selectedServices.map(({ service, duration }) => ({
      service,
      basePrice: service.price,
      duration: duration || 0,
      discount: getDiscountPercentage(duration),
      discountedMonthlyPrice: getMonthlyPrice(service.price, duration),
      pricePerUser: getMonthlyPrice(service.price, duration),
      numberOfUsers: selectedUsers.length,
      totalPrice: getServiceTotal(service, duration)
    }));

    const totalPrice = calculations.reduce((sum, calc) => sum + calc.totalPrice, 0);
    const maxDuration = Math.max(...selectedServices.map(s => s.duration || 0), 1);
    const effectiveMonthlyPrice = totalPrice / maxDuration;

    return {
      calculations,
      totalPrice,
      effectiveMonthlyPrice,
      monthlyWithUsers: calculations.reduce((sum, calc) => sum + calc.discountedMonthlyPrice * selectedUsers.length, 0)
    };
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthError('Erreur lors de la connexion avec Google');
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      setAuthError('Email ou mot de passe incorrect');
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setAuthError(null);
      
      // Vérifier que le mot de passe est assez long
      if (loginPassword.length < 6) {
        setAuthError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      // Créer le compte
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: loginEmail,
        createdAt: serverTimestamp(),
        role: 'user'
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/email-already-in-use':
            setAuthError('Cette adresse email est déjà utilisée');
            break;
          case 'auth/invalid-email':
            setAuthError('Adresse email invalide');
            break;
          case 'auth/operation-not-allowed':
            setAuthError('L\'inscription par email n\'est pas activée');
            break;
          case 'auth/weak-password':
            setAuthError('Le mot de passe est trop faible');
            break;
          default:
            setAuthError('Une erreur est survenue lors de l\'inscription');
        }
      } else {
        setAuthError('Une erreur est survenue lors de l\'inscription');
      }
    }
  };

  const resetForm = () => {
    setSelectedServices([]);
    setSelectedUsers([]);
    setCurrentStep('services');
    setPaymentMethod('bank-transfer');
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setError('Vous devez être connecté pour commander un service');
      return;
    }

    setIsLoading(true);
    try {
      // Créer la commande dans Firestore
      const orderRef = collection(db, 'userServices');
      
      // Pour chaque service sélectionné et chaque utilisateur sélectionné
      for (const service of selectedServices) {
        for (const userId of selectedUsers) {
          const user = companyUsers.find(u => u.id === userId);
          
          // Calculer le prix avec la réduction selon la durée
          let finalPrice = service.service.price;
          if (service.duration === 12) {
            finalPrice = finalPrice * 0.9; // -10%
          } else if (service.duration === 24) {
            finalPrice = finalPrice * 0.8; // -20%
          }

          // Calculer la date de fin en fonction de la durée
          const endDate = service.duration 
            ? new Date(Date.now() + service.duration * 30 * 24 * 60 * 60 * 1000)
            : null;

          const serviceData = {
            serviceId: service.service.id,
            name: service.service.name,
            description: service.service.description,
            monthlyPrice: finalPrice,
            duration: service.duration || 0,
            status: requireValidation ? 'pending' : 'active',
            startDate: new Date(),
            endDate: endDate,
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: company.id,
            users: [{
              userId: userId,
              email: user?.email || ''
            }],
            category: service.service.category
          };

          await addDoc(orderRef, serviceData);
        }
      }

      // Afficher la notification de succès
      setShowSuccess(true);
      
      // Réinitialiser le formulaire
      resetForm();
      
      // Fermer la notification et le modal après 2 secondes
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setError('Une erreur est survenue lors de la création de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (serviceId: string) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.service.id === serviceId);
      
      if (isSelected) {
        return prev.filter(s => s.service.id !== serviceId);
      } else {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          if (service.category === 'remote-desktop') {
            return [{ service, duration: null }];
          }
          return [...prev, { service, duration: null }];
        }
      }
      return prev;
    });
  };

  const getSelectedDuration = (serviceId: string): number | null => {
    const selection = selectedServices.find(s => s.service.id === serviceId);
    return selection?.duration || null;
  };

  const getDiscount = (months: number): number => {
    switch (months) {
      case 12: return 10;
      case 24: return 15;
      case 36: return 20;
      default: return 0;
    }
  };

  const handleDurationSelect = (serviceId: string, months: number) => {
    setSelectedServices(prev => prev.map(selection => {
      if (selection.service.id === serviceId) {
        // Si la même durée est sélectionnée, on la désélectionne
        const newDuration = selection.duration === months ? null : months as SubscriptionDuration;
        return { ...selection, duration: newDuration };
      }
      return selection;
    }));
  };

  const getDiscountedPrice = (basePrice: number, duration: number | null): number => {
    if (!duration) return basePrice;
    const discount = getDiscount(duration);
    return basePrice * (1 - discount / 100);
  };

  const renderServiceCard = (service: Service) => {
    const isSelected = selectedServices.some(s => s.service.id === service.id);
    const selectedDuration = getSelectedDuration(service.id);
    const currentPrice = getDiscountedPrice(service.price, selectedDuration);

    return (
      <div
        key={service.id}
        onClick={() => handleCardClick(service.id)}
        className={`relative p-6 bg-white rounded-xl transition-all border-2 cursor-pointer ${
          isSelected
            ? 'border-blue-600 shadow-lg ring-1 ring-blue-600'
            : 'border-transparent hover:border-blue-200 hover:shadow-lg'
        }`}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <CheckIcon className="h-5 w-5 text-blue-600 bg-white rounded-full" />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-blue-600">
                €{currentPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-1">/mois</span>
            </div>
            
            {isSelected && (
              <div className="mt-4 space-y-2" onClick={e => e.stopPropagation()}>
                {[12, 24, 36].map((months) => (
                  <label
                    key={months}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedDuration === months
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`duration-${service.id}`}
                        checked={selectedDuration === months}
                        onChange={() => handleDurationSelect(service.id, months)}
                        className="text-blue-600"
                      />
                      <span>{months} mois</span>
                    </div>
                    <span className="text-green-600">-{getDiscount(months)}%</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderServicesStep = () => (
    <div className="h-[700px] bg-gray-50">
      <div className="flex h-full">
        {/* Menu de gauche */}
        <div className="w-72 bg-white shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Catégories</h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory(category.id as Category)}
                >
                  <Icon className={`h-5 w-5 ${
                    selectedCategory === category.id ? 'text-white' : 'text-blue-600'
                  }`} />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">
              {categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            
            {selectedCategory === 'remote-desktop' && (
              <p className="text-gray-600 mb-6 text-sm">
                Veuillez sélectionner une seule option pour Remote Desktop
              </p>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services
                .filter(service => service.category === selectedCategory)
                .map(renderServiceCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Détails des Utilisateurs</h2>
      
      {users.map((user, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Prénom"
              className="p-2 border rounded"
              value={user.firstName}
              onChange={(e) => {
                const newUsers = [...users];
                newUsers[index].firstName = e.target.value;
                setUsers(newUsers);
              }}
            />
            <input
              type="text"
              placeholder="Nom"
              className="p-2 border rounded"
              value={user.lastName}
              onChange={(e) => {
                const newUsers = [...users];
                newUsers[index].lastName = e.target.value;
                setUsers(newUsers);
              }}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={user.email}
            onChange={(e) => {
              const newUsers = [...users];
              newUsers[index].email = e.target.value;
              setUsers(newUsers);
            }}
          />
        </div>
      ))}
      
      <button
        className="text-blue-600 hover:text-blue-700"
        onClick={() => setUsers([...users, { firstName: '', lastName: '', email: '' }])}
      >
        + Ajouter un utilisateur
      </button>
    </div>
  );

  const renderCompanyStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Détails de l'Entreprise</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nom de l'entreprise"
          className="p-2 border rounded"
          value={company.name}
          onChange={(e) => setCompany({ ...company, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={company.email}
          onChange={(e) => setCompany({ ...company, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Numéro de téléphone"
          className="p-2 border rounded"
          value={company.phone}
          onChange={(e) => setCompany({ ...company, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Numéro de TVA"
          className="p-2 border rounded"
          value={company.vatNumber}
          onChange={(e) => setCompany({ ...company, vatNumber: e.target.value })}
        />
        <input
          type="text"
          placeholder="Adresse"
          className="p-2 border rounded md:col-span-2"
          value={company.address}
          onChange={(e) => setCompany({ ...company, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Code postal"
          className="p-2 border rounded"
          value={company.postalCode}
          onChange={(e) => setCompany({ ...company, postalCode: e.target.value })}
        />
        <input
          type="text"
          placeholder="Ville"
          className="p-2 border rounded"
          value={company.city}
          onChange={(e) => setCompany({ ...company, city: e.target.value })}
        />
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paiement</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'bank-transfer',
              label: 'Virement bancaire',
              description: 'Paiement par virement bancaire',
              icon: BuildingLibraryIcon
            },
            {
              id: 'sepa',
              label: 'Prélèvement SEPA',
              description: 'Paiement automatique par prélèvement',
              icon: BanknotesIcon
            },
            {
              id: 'credit-card',
              label: 'Carte bancaire',
              description: 'Paiement sécurisé par carte',
              icon: CreditCardIcon
            }
          ].map((method) => (
            <label
              key={method.id}
              className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${
                paymentMethod === method.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="sr-only"
              />
              {paymentMethod === method.id && (
                <div className="absolute top-3 right-3">
                  <div className="bg-blue-600 text-white p-1 rounded-full">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                </div>
              )}
              <method.icon className="h-6 w-6 text-blue-600 mb-2" />
              <span className="font-medium mb-1">{method.label}</span>
              <span className="text-sm text-gray-500">{method.description}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const getMonthlyPrice = (basePrice: number, duration: number | null): number => {
    if (!duration) return basePrice;
    const discount = getDiscount(duration);
    return basePrice * (1 - discount / 100);
  };

  const getServiceTotal = (service: Service, duration: number | null): number => {
    if (!duration) return getMonthlyPrice(service.price, null);
    const monthlyPrice = getMonthlyPrice(service.price, duration);
    return monthlyPrice * duration;
  };

  const calculateTotal = (): number => {
    if (selectedServices.length === 0) return 0;
    
    const total = selectedServices.reduce((sum, { service, duration }) => {
      if (!duration) {
        return sum + getMonthlyPrice(service.price, null);
      }
      const serviceTotal = getServiceTotal(service, duration);
      return sum + serviceTotal;
    }, 0);

    return total;
  };

  const renderServicePriceDetails = (calculation: ReturnType<typeof calculatePrices>['calculations'][0]) => (
    <div className="text-right">
      <div className="text-lg font-semibold text-gray-900">
        €{calculation.pricePerUser.toFixed(2)}
        <span className="text-sm text-gray-500">/utilisateur/mois</span>
      </div>
      <div className="text-sm text-gray-600">
        {calculation.numberOfUsers} utilisateur{calculation.numberOfUsers > 1 ? 's' : ''} × {calculation.duration} mois
      </div>
      <div className="text-sm font-medium text-blue-600 mt-1">
        Total: €{calculation.totalPrice.toFixed(2)}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Résumé de la commande</h2>
        <div className="text-sm text-gray-500">
          Commande #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
      </div>
      
      {/* Services et facturation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5 text-blue-600" />
            Services sélectionnés
          </h3>
          
          <div className="mt-6 space-y-4">
            {calculatePrices().calculations.map((calculation) => (
              <div key={calculation.service.id} className="flex items-start justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {calculation.service.category === 'remote-desktop' && <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />}
                      {calculation.service.category === 'microsoft-365' && <WindowIcon className="h-5 w-5 text-blue-600" />}
                      {calculation.service.category === 'accounting' && <CalculatorIcon className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{calculation.service.name}</h4>
                      <p className="text-sm text-gray-600">{calculation.service.description}</p>
                    </div>
                  </div>
                  {calculation.duration && (
                    <div className="mt-2 ml-10 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Engagement {calculation.duration} mois (-{(calculation.discount * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )}
                </div>
                {renderServicePriceDetails(calculation)}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">Total engagement</p>
                <p className="text-sm text-gray-600 mt-1">
                  Pour {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  €{calculatePrices().totalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 text-right">
                  soit €{(calculatePrices().monthlyWithUsers).toFixed(2)}/mois
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="grid grid-cols-2 gap-6">
        {/* Entreprise */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
            Entreprise
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Nom</dt>
              <dd className="font-medium">{company.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">N° TVA</dt>
              <dd className="font-medium">{company.vatNumber}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Contact</dt>
              <dd className="font-medium">{company.email}</dd>
              <dd className="font-medium">{company.phone}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Adresse</dt>
              <dd className="font-medium">
                {company.address}<br />
                {company.postalCode} {company.city}
              </dd>
            </div>
          </dl>
        </div>

        {/* Paiement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <CreditCardIcon className="h-5 w-5 text-blue-600" />
            Paiement
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Méthode de paiement</dt>
              <dd className="font-medium flex items-center gap-2">
                {paymentMethod === 'bank-transfer' && (
                  <>
                    <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                    Virement bancaire
                  </>
                )}
                {paymentMethod === 'sepa' && (
                  <>
                    <BanknotesIcon className="h-5 w-5 text-gray-400" />
                    Prlèvement SEPA
                  </>
                )}
                {paymentMethod === 'credit-card' && (
                  <>
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    Carte bancaire
                  </>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <UsersIcon className="h-5 w-5 text-blue-600" />
          Utilisateurs ({selectedUsers.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyUsers
            .filter(user => selectedUsers.includes(user.id))
            .map((user) => (
              <div key={user.id} className="p-4 rounded-lg bg-gray-50 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {getInitials(user)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="ml-auto">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}
                  `}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Section Authentification */}
      {!auth.currentUser && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <UserIcon className="h-5 w-5 text-blue-600" />
            Authentification requise
          </h3>

          <div className="space-y-6">
            {/* Connexion avec Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Formulaire de connexion/inscription */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {authError}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleEmailSignIn}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={handleEmailSignUp}
                  className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800">
            Vos services seront en attente de validation. Nous vous contacterons rapidement pour finaliser l'activation.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    console.log('Current step:', currentStep);
    console.log('Is patron:', isPatron);
    
    if (isPatron && currentStep === 'users') {
      console.log('Rendering company users list');
      return renderCompanyUsersList();
    }

    switch (currentStep) {
      case 'services':
        return renderServicesStep();
      case 'users':
        return renderUsersStep();
      case 'company':
        return renderCompanyStep();
      case 'payment':
        return renderPaymentStep();
      case 'summary':
        return renderSummary();
      default:
        return null;
    }
  };

  const getNextStep = () => {
    switch (currentStep) {
      case 'services':
        return 'users';
      case 'users':
        return 'company';
      case 'company':
        return 'payment';
      case 'payment':
        return 'summary';
      default:
        return null;
    }
  };

  const getPreviousStep = () => {
    switch (currentStep) {
      case 'users':
        return 'services';
      case 'company':
        return 'users';
      case 'payment':
        return 'company';
      case 'summary':
        return 'payment';
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Enregistrement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Notification de succès */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          Commande effectuée avec succès !
        </div>
      )}

      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>

        {renderStep()}

        <div className="flex justify-between mt-6 pt-6 border-t">
          {currentStep !== 'services' && (
            <button
              onClick={() => setCurrentStep(getPreviousStep() as Step)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Retour
            </button>
          )}

          {currentStep === 'summary' ? (
            <button
              onClick={handleSubmit}
              disabled={!auth.currentUser || isLoading}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                !auth.currentUser || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Valider la commande
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(getNextStep() as Step)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continuer
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 