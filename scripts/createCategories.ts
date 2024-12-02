import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

const categories = [
  {
    name: "Remote Desktop",
    description: "Solutions de bureau à distance sécurisées et performantes",
    icon: "monitor",
    slug: "remote-desktop",
    order: 1
  },
  {
    name: "Microsoft 365",
    description: "Suite complète d'outils de productivité Microsoft",
    icon: "microsoft",
    slug: "microsoft-365",
    order: 2
  },
  {
    name: "Comptabilité",
    description: "Solutions de gestion comptable et financière",
    icon: "calculator",
    slug: "accounting",
    order: 3
  }
];

const createCategories = async () => {
  try {
    const categoriesCollection = collection(db, 'categories');
    
    for (const category of categories) {
      const docRef = await addDoc(categoriesCollection, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Catégorie créée avec l'ID: ${docRef.id}`);
    }

    console.log('Toutes les catégories ont été créées avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des catégories:', error);
    process.exit(1);
  }
};

createCategories(); 