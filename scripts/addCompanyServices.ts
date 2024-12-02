import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import type { Service, Company } from '@/types';

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

interface CompanyService {
  id: string;
  serviceId: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  startDate: Date;
  endDate: Date;
  duration: number; // en mois
  monthlyPrice: number;
  users: {
    userId: string;
    email: string;
  }[];
}

interface FirestoreService extends Service {
  id: string;
  createdAt: Date;
}

async function addServicesToCompanies() {
  try {
    // Se connecter en tant qu'admin
    await signInWithEmailAndPassword(auth, 'admin@cloudbizz.com', 'test1234');

    // Récupérer toutes les entreprises
    const companiesSnap = await getDocs(collection(db, 'companies'));
    
    // Récupérer tous les services disponibles
    const servicesSnap = await getDocs(collection(db, 'services'));
    const services = servicesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreService[];

    for (const companyDoc of companiesSnap.docs) {
      const company = companyDoc.data() as Company;
      const companyServices: CompanyService[] = [];

      // Ajouter des services aléatoires pour chaque entreprise
      const numberOfServices = Math.floor(Math.random() * 3) + 1; // 1 à 3 services

      for (let i = 0; i < numberOfServices; i++) {
        const randomService = services[Math.floor(Math.random() * services.length)];
        const duration = [12, 24, 36][Math.floor(Math.random() * 3)]; // 12, 24 ou 36 mois
        
        // Calculer la réduction basée sur la durée
        let discount = 0;
        if (duration === 12) discount = 0.10;
        else if (duration === 24) discount = 0.15;
        else if (duration === 36) discount = 0.20;

        const monthlyPrice = randomService.price * (1 - discount);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + duration);

        // Assigner le service à tous les utilisateurs de l'entreprise
        const serviceUsers = company.users.map(user => ({
          userId: user.userId,
          email: user.email
        }));

        companyServices.push({
          id: `${randomService.id}_${company.id}`,
          serviceId: randomService.id,
          name: randomService.name,
          status: 'active',
          startDate,
          endDate,
          duration,
          monthlyPrice,
          users: serviceUsers
        });
      }

      // Calculer le revenu mensuel total
      const monthlyRevenue = companyServices.reduce((total, service) => 
        total + (service.monthlyPrice * service.users.length), 0
      );

      // Mettre à jour l'entreprise avec les services et le revenu mensuel
      await updateDoc(doc(db, 'companies', companyDoc.id), {
        services: companyServices.map(service => ({
          ...service,
          startDate: service.startDate.toISOString(),
          endDate: service.endDate.toISOString()
        })),
        monthlyRevenue
      });

      // Créer les userServices pour chaque utilisateur
      for (const service of companyServices) {
        for (const user of service.users) {
          const userServiceRef = doc(collection(db, 'userServices'));
          await setDoc(userServiceRef, {
            id: userServiceRef.id,
            userId: user.userId,
            serviceId: service.serviceId,
            companyId: companyDoc.id,
            status: 'active',
            startDate: service.startDate.toISOString(),
            endDate: service.endDate.toISOString(),
            duration: service.duration,
            monthlyPrice: service.monthlyPrice,
            createdAt: new Date().toISOString()
          });
        }
      }

      console.log(`Services ajoutés pour ${company.name}`);
    }

    console.log('Services ajoutés à toutes les entreprises avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'ajout des services:', error);
    process.exit(1);
  }
}

addServicesToCompanies(); 