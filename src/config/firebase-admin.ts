import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();

// Ajouter une fonction de vérification de connexion
export const verifyConnection = () => {
  return db.collection('_health').doc('status').get()
    .then(() => true)
    .catch((error) => {
      console.error('Firebase connection error:', error);
      return false;
    });
};