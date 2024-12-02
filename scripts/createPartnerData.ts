import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  CollectionReference 
} from 'firebase/firestore';
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

const createPartnerData = async () => {
  try {
    // Créer le partenaire
    const partnerUser = {
      email: 'partner@cloudbizz.be',
      password: 'partner1234',
      role: 'partner',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+32 495 12 34 56'
    };

    let partnerId = '';
    try {
      const partnerCredential = await createUserWithEmailAndPassword(
        auth,
        partnerUser.email,
        partnerUser.password
      );
      partnerId = partnerCredential.user.uid;

      await setDoc(doc(db, 'users', partnerId), {
        id: partnerId,
        email: partnerUser.email,
        role: partnerUser.role,
        firstName: partnerUser.firstName,
        lastName: partnerUser.lastName,
        phone: partnerUser.phone,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      console.log(`Partenaire créé: ${partnerUser.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`Le partenaire ${partnerUser.email} existe déjà`);
      } else {
        throw error;
      }
    }

    // Créer l'entreprise liée au partenaire
    const company = {
      id: 'digital_solutions',
      name: 'Digital Solutions',
      email: 'contact@digital-solutions.be',
      phone: '+32 2 345 67 89',
      vatNumber: 'BE0987654321',
      address: 'Rue du Commerce 15',
      postalCode: '1000',
      city: 'Bruxelles',
      country: 'Belgique',
      partnerId: partnerId, // Lier l'entreprise au partenaire
      billing: {
        monthlyRevenue: 0,
        paymentMethod: 'bank_transfer'
      },
      activity: [],
      createdAt: new Date()
    };

    await setDoc(doc(db, 'companies', company.id), company);
    console.log(`Entreprise créée: ${company.name}`);

    // Créer le propriétaire de l'entreprise
    const ownerUser = {
      email: 'owner@digital-solutions.be',
      password: 'owner1234',
      role: 'companyowner',
      firstName: 'Pierre',
      lastName: 'Martin',
      companyId: company.id
    };

    try {
      const ownerCredential = await createUserWithEmailAndPassword(
        auth,
        ownerUser.email,
        ownerUser.password
      );

      await setDoc(doc(db, 'users', ownerCredential.user.uid), {
        id: ownerCredential.user.uid,
        email: ownerUser.email,
        role: ownerUser.role,
        firstName: ownerUser.firstName,
        lastName: ownerUser.lastName,
        companyId: ownerUser.companyId,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      console.log(`Propriétaire créé: ${ownerUser.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`Le propriétaire ${ownerUser.email} existe déjà`);
      } else {
        throw error;
      }
    }

    // Créer l'employé
    const employeeUser = {
      email: 'employee@digital-solutions.be',
      password: 'employee1234',
      role: 'employee',
      firstName: 'Marie',
      lastName: 'Dubois',
      companyId: company.id
    };

    try {
      const employeeCredential = await createUserWithEmailAndPassword(
        auth,
        employeeUser.email,
        employeeUser.password
      );

      await setDoc(doc(db, 'users', employeeCredential.user.uid), {
        id: employeeCredential.user.uid,
        email: employeeUser.email,
        role: employeeUser.role,
        firstName: employeeUser.firstName,
        lastName: employeeUser.lastName,
        companyId: employeeUser.companyId,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      console.log(`Employé créé: ${employeeUser.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`L'employé ${employeeUser.email} existe déjà`);
      } else {
        throw error;
      }
    }

    // Créer quelques factures de test
    const invoices = [
      {
        number: 'FAC-2024-001',
        companyId: company.id,
        total: 1500.00,
        status: 'paid',
        issuedAt: new Date(2024, 0, 15),
        dueDate: new Date(2024, 1, 15),
        items: [
          { description: 'Service Cloud - Janvier 2024', amount: 1500.00 }
        ]
      },
      {
        number: 'FAC-2024-002',
        companyId: company.id,
        total: 2000.00,
        status: 'sent',
        issuedAt: new Date(2024, 1, 15),
        dueDate: new Date(2024, 2, 15),
        items: [
          { description: 'Service Cloud - Février 2024', amount: 2000.00 }
        ]
      }
    ];

    const invoicesCollection = collection(db, 'invoices');
    
    for (const invoice of invoices) {
      const invoiceRef = doc(invoicesCollection);
      await setDoc(invoiceRef, {
        ...invoice,
        id: invoiceRef.id,
        createdAt: new Date()
      });
      console.log(`Facture créée: ${invoice.number}`);
    }

    console.log('Données de test du partenaire créées avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création des données de test:', error);
    process.exit(1); // Sortie avec code d'erreur
  }
};

// Exécuter le script avec gestion des erreurs
createPartnerData()
  .then(() => {
    console.log('Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  }); 