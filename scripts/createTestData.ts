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

const createTestData = async () => {
  try {
    // Create companies
    const companies = [
      {
        id: 'acome_corporation',
        name: 'Acome Corporation',
        email: 'contact@acome-corporation.be',
        phone: '+32 2 123 45 67',
        vatNumber: 'BE0123456789',
        address: 'Rue de la Loi 42',
        postalCode: '1000',
        city: 'Bruxelles',
        country: 'Belgique',
        billing: {
          monthlyRevenue: 0,
          paymentMethod: 'bank_transfer'
        },
        activity: []
      },
      {
        id: 'techcorp',
        name: 'TechCorp',
        email: 'contact@techcorp.be',
        phone: '+32 2 987 65 43',
        vatNumber: 'BE9876543210',
        address: 'Avenue Louise 123',
        postalCode: '1050',
        city: 'Bruxelles',
        country: 'Belgique',
        billing: {
          monthlyRevenue: 0,
          paymentMethod: 'bank_transfer'
        },
        activity: []
      }
    ];

    for (const company of companies) {
      await setDoc(doc(db, 'companies', company.id), company);
      console.log(`Entreprise créée: ${company.name}`);
    }

    // Create users
    const users = [
      {
        email: 'admin@cloudbizz.com',
        password: 'test1234',
        role: 'master'
      },
      {
        email: 'patron1@acome-corporation.be',
        password: 'password1234',
        role: 'client',
        companyId: 'acome_corporation'
      },
      {
        email: 'patron2@techcorp.be',
        password: 'password1234',
        role: 'client',
        companyId: 'techcorp'
      },
      {
        email: 'employee3@techcorp.be',
        password: 'password1234',
        role: 'employee',
        companyId: 'acome_corporation'
      },
      {
        email: 'employee4@techcorp.be',
        password: 'password1234',
        role: 'employee',
        companyId: 'acome_corporation'
      }
    ];

    for (const user of users) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          createdAt: new Date(),
          lastLogin: new Date()
        });

        console.log(`Utilisateur créé: ${user.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`L'utilisateur ${user.email} existe déjà`);
        } else {
          console.error(`Erreur lors de la création de l'utilisateur ${user.email}:`, error);
        }
      }
    }

    console.log('Données de test créées avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création des données de test:', error);
  }
};

createTestData(); 