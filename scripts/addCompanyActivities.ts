import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

const sampleActivities = [
  {
    id: '1',
    type: 'service_activated',
    description: 'Ajout du service Remote Desktop - Plan 2',
    userId: 'john_doe',
    userEmail: 'John Doe',
    timestamp: new Date(),
    metadata: {
      serviceName: 'Remote Desktop - Plan 2',
      duration: 12
    }
  },
  {
    id: '2',
    type: 'user_added',
    description: 'Nouvel utilisateur ajouté : Sarah Connor',
    userId: 'admin',
    userEmail: 'Admin',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    metadata: {
      newUserEmail: 'sarah.connor@company.com'
    }
  },
  {
    id: '3',
    type: 'payment_received',
    description: 'Modification du mode de paiement',
    userId: 'john_doe',
    userEmail: 'John Doe',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    metadata: {
      amount: 148.72
    }
  }
];

async function addActivitiesToCompanies() {
  try {
    // Se connecter en tant qu'admin
    await signInWithEmailAndPassword(auth, 'admin@cloudbizz.com', 'test1234');

    // Récupérer toutes les entreprises
    const companiesSnap = await getDocs(collection(db, 'companies'));
    
    for (const companyDoc of companiesSnap.docs) {
      // Ajouter les activités à chaque entreprise
      await updateDoc(doc(db, 'companies', companyDoc.id), {
        activity: sampleActivities
      });
      console.log(`Activités ajoutées pour ${companyDoc.data().name}`);
    }

    console.log('Activités ajoutées à toutes les entreprises avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'ajout des activités:', error);
    process.exit(1);
  }
}

addActivitiesToCompanies(); 