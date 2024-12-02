import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const db = getFirestore(app); 