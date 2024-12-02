import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function createAdminUser() {
  try {
    // Supprimer l'ancien compte admin s'il existe
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'admin@cloudbizz.com', 'admin123456');
      if (userCredential.user) {
        await deleteUser(userCredential.user);
      }
    } catch (e) {
      // Ignore les erreurs si le compte n'existe pas
      console.log('Aucun compte admin existant trouvé');
    }

    // Créer le nouveau compte admin
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@cloudbizz.com',
      'test1234'
    );

    // Créer le profil admin dans Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      id: userCredential.user.uid,
      email: 'admin@cloudbizz.com',
      role: 'master',
      firstName: 'Admin',
      lastName: 'Master',
      createdAt: new Date()
    });

    console.log('Compte admin créé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création du compte admin:', error);
    process.exit(1);
  }
}

createAdminUser(); 