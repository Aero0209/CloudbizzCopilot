import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD412dmT45D7lWT4dkkECP5kaOrc3pfm5w",
  authDomain: "cloudbizz-e76d1.firebaseapp.com",
  projectId: "cloudbizz-e76d1",
  storageBucket: "cloudbizz-e76d1.firebasestorage.app",
  messagingSenderId: "227454553022",
  appId: "1:227454553022:web:f4ca901e1edc3060f887ef",
  measurementId: "G-BSH7TGDD0Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const defaultModules = [
  {
    id: 'catalogue-services',
    key: 'catalogue-services',
    name: 'Services',
    description: 'Catalogue des services et abonnements',
    isEnabled: true,
    icon: 'Package',
    href: '/catalogue/services',
    color: 'blue',
    features: [
      {
        id: 'services-management',
        name: 'Gestion des services',
        description: 'Gestion des services et abonnements',
        isEnabled: true
      }
    ],
    settings: {
      requireValidation: false,
      categories: [
        {
          id: 'remote-desktop',
          name: 'Remote Desktop',
          description: 'Solutions de bureau à distance',
          icon: 'monitor',
          slug: 'remote-desktop',
          order: 1
        },
        {
          id: 'microsoft-365',
          name: 'Microsoft 365',
          description: 'Suite Microsoft Office',
          icon: 'microsoft',
          slug: 'microsoft-365',
          order: 2
        },
        {
          id: 'accounting',
          name: 'Comptabilité',
          description: 'Solutions comptables',
          icon: 'calculator',
          slug: 'accounting',
          order: 3
        }
      ]
    },
    requiredRoles: ['master', 'admin'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'catalogue-devices',
    key: 'catalogue-devices',
    name: 'Appareils',
    description: 'Catalogue des appareils',
    isEnabled: true,
    icon: 'Laptop',
    href: '/catalogue/devices',
    color: 'green',
    features: [
      {
        id: 'devices-management',
        name: 'Gestion des appareils',
        description: 'Gestion du parc d\'appareils',
        isEnabled: true
      }
    ],
    settings: {
      requireValidation: true,
      categories: [
        {
          id: 'computers',
          name: 'Ordinateurs',
          description: 'PC et portables',
          icon: 'laptop',
          slug: 'computers',
          order: 1
        },
        {
          id: 'phones',
          name: 'Téléphones',
          description: 'Smartphones et fixes',
          icon: 'phone',
          slug: 'phones',
          order: 2
        }
      ]
    },
    requiredRoles: ['master', 'admin'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
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