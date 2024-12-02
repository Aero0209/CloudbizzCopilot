'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { UserProfile } from '@/types';
import ServiceSelectionModal from '@/components/ServiceSelectionModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <nav className="border-b">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Cloudbizz
          </Link>

          <div className="flex-1 flex justify-center gap-12">
            <Link href="/services" className="hover:text-blue-600">Services</Link>
            <Link href="/partenaires" className="hover:text-blue-600">Partenaires</Link>
            <Link href="/contact" className="hover:text-blue-600">Contact</Link>
          </div>

          <div>
            {userProfile ? (
              <div className="flex items-center gap-4">
                {userProfile.role === 'user' && (
                  <Link 
                    href="/register/company"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Créer une entreprise
                  </Link>
                )}
                <Link 
                  href="/dashboard" 
                  className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Mon espace
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/login"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register/company"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Essai gratuit
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6">
            Solutions cloud pour votre entreprise
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transformez votre culture d&apos;entreprise pour faciliter votre
            transformation digitale. Nous sommes à vos côtés pour vous
            accompagner dans cette transformation.
          </p>
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold w-fit hover:bg-blue-700 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Essai 30 jours
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="https://images.unsplash.com/photo-1603201667141-5324c62cd9fd?q=80&w=500&auto=format&fit=crop"
            alt="Team collaboration"
            width={500}
            height={384}
            className="rounded-lg shadow-lg w-full h-48 object-cover"
          />
          <Image
            src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=500&auto=format&fit=crop"
            alt="Modern workspace"
            width={500}
            height={384}
            className="rounded-lg shadow-lg w-full h-48 object-cover"
          />
          <Image
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=500&auto=format&fit=crop"
            alt="Office setup"
            width={500}
            height={384}
            className="rounded-lg shadow-lg w-full h-48 object-cover"
          />
          <Image
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=500&auto=format&fit=crop"
            alt="Digital workspace"
            width={500}
            height={384}
            className="rounded-lg shadow-lg w-full h-48 object-cover"
          />
        </div>
      </div>

      <ServiceSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
} 