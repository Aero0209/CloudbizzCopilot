import { db } from '@/config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const defaultModules = [
  {
    id: 'billing',
    key: 'billing',
    name: 'Facturation',
    description: 'Gestion des factures et des paiements',
    isEnabled: true,
    icon: 'FileText',
    features: [
      {
        id: 'invoice-generation',
        name: 'Génération automatique',
        description: 'Génération automatique des factures mensuelles',
        isEnabled: true
      },
      {
        id: 'invoice-validation',
        name: 'Validation des factures',
        description: 'Validation manuelle des factures avant envoi',
        isEnabled: false
      }
    ],
    settings: {
      requireValidation: false,
      autoGenerateInvoices: true,
      paymentMethods: ['bank-transfer', 'sepa']
    },
    requiredRoles: ['master', 'admin'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ... autres modules
];

async function initializeModules() {
  try {
    for (const module of defaultModules) {
      await setDoc(doc(db, 'modules', module.id), module);
      console.log(`Module ${module.name} initialisé`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des modules:', error);
  }
}

initializeModules(); 