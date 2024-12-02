import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
const auth = getAuth(app);
const db = getFirestore(app);

const services = [
  // Remote Desktop Services
  {
    id: 'one-ap',
    name: 'One AP',
    price: 45.00,
    description: 'Basic solution for small businesses',
    category: 'remote-desktop',
  },
  {
    id: 'plan-1',
    name: 'Plan 1',
    price: 56.00,
    description: 'Ideal for growing teams',
    category: 'remote-desktop',
  },
  {
    id: 'plan-2',
    name: 'Plan 2',
    price: 62.00,
    description: 'Advanced needs for businesses',
    category: 'remote-desktop',
  },
  {
    id: 'go-one',
    name: 'Go One',
    price: 45.00,
    description: 'Comprehensive solution for professionals',
    category: 'remote-desktop',
  },
  {
    id: 'go-hub',
    name: 'Go Hub',
    price: 55.00,
    description: 'Advanced collaborative platform',
    category: 'remote-desktop',
  },
  {
    id: 'go-pro',
    name: 'Go Pro',
    price: 62.00,
    description: 'Premium features for experts',
    category: 'remote-desktop',
  },
  {
    id: 'go-max',
    name: 'Go Max',
    price: 95.00,
    description: 'Ultimate solution without compromise',
    category: 'remote-desktop',
  },

  // Microsoft 365 Services
  {
    id: 'pro-plus',
    name: 'Pro Plus',
    price: 17.16,
    description: 'Complete suite of Microsoft apps',
    category: 'microsoft-365',
  },
  {
    id: 'business-premium',
    name: 'Business Premium',
    price: 24.72,
    description: 'All-in-one business solution',
    category: 'microsoft-365',
  },
  {
    id: 'exchange-online-1',
    name: 'Exchange Online Plan 1',
    price: 4.70,
    description: 'Basic professional email',
    category: 'microsoft-365',
  },
  {
    id: 'exchange-online-2',
    name: 'Exchange Online Plan 2',
    price: 9.00,
    description: 'Advanced professional email',
    category: 'microsoft-365',
  },

  // Accounting Software Services
  {
    id: 'horus',
    name: 'Horus',
    price: 5.50,
    description: 'Comprehensive accounting solution',
    category: 'accounting',
  },
  {
    id: 'winbooks',
    name: 'Winbooks',
    price: 5.50,
    description: 'Advanced accounting software',
    category: 'accounting',
  },
  {
    id: 'popsy',
    name: 'Popsy',
    price: 5.50,
    description: 'Simplified accounting management',
    category: 'accounting',
  },
];

async function createServices() {
  try {
    // Se connecter avec le compte master
    await signInWithEmailAndPassword(auth, 'admin@cloudbizz.com', 'admin123456');

    for (const service of services) {
      await setDoc(doc(db, 'services', service.id), {
        ...service,
        createdAt: new Date()
      });
      console.log(`Service créé: ${service.name}`);
    }
    console.log('Tous les services ont été créés avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des services:', error);
    process.exit(1);
  }
}

createServices(); 