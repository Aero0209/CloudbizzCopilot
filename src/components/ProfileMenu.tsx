'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { 
  User,
  Building2,
  Bell,
  Shield,
  HelpCircle,
  Clock,
  LogOut
} from 'lucide-react';
import { UserProfile } from '@/types';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!isOpen || !userProfile) return null;

  // Traduire le rôle en français
  const roleLabels: Record<string, string> = {
    'master': 'Master',
    'partner': 'Partenaire',
    'client': 'Client',
    'employee': 'Employé'
  };

  return (
    <div className="absolute right-0 top-16 w-64 bg-white rounded-lg shadow-lg border py-2">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="font-medium">
          {userProfile.firstName} {userProfile.lastName}
        </div>
        <div className="text-sm text-gray-500">{userProfile.email}</div>
        <div className="text-xs text-blue-600 mt-1">
          {roleLabels[userProfile.role] || userProfile.role}
        </div>
      </div>

      {/* COMPTE Section */}
      <div className="px-2 py-2">
        <div className="px-2 py-1 text-xs font-medium text-gray-500">COMPTE</div>
        <Link href="/profile" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <User className="h-4 w-4" />
          Mon profil
        </Link>
        <Link href="/company" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Building2 className="h-4 w-4" />
          Ma société
        </Link>
        <Link href="/notifications" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
        <Link href="/security" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Shield className="h-4 w-4" />
          Sécurité
        </Link>
      </div>

      {/* SUPPORT Section */}
      <div className="px-2 py-2 border-t">
        <div className="px-2 py-1 text-xs font-medium text-gray-500">SUPPORT</div>
        <Link href="/help" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <HelpCircle className="h-4 w-4" />
          Centre d'aide
        </Link>
        <Link href="/history" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Clock className="h-4 w-4" />
          Historique
        </Link>
      </div>

      {/* Déconnexion */}
      <div className="px-2 py-2 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
} 