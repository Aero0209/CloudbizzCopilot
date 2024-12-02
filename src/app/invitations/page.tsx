'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Invitation {
  id: string;
  email: string;
  companyId: string;
  companyName: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: string;
  createdAt: Date;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Écouter les invitations en temps réel
      const q = query(
        collection(db, 'invitations'),
        where('email', '==', user.email)
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const invitationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invitation[];
        setInvitations(invitationData);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribe();
  }, [router]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      // Mettre à jour l'invitation
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'accepted'
      });

      // Mettre à jour l'utilisateur
      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        companyId: invitation.companyId,
        role: invitation.role
      });

      // Mettre à jour l'entreprise
      const companyRef = doc(db, 'companies', invitation.companyId);
      await updateDoc(companyRef, {
        employees: arrayUnion(auth.currentUser!.uid)
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'rejected'
      });
    } catch (error) {
      console.error('Erreur lors du rejet de l\'invitation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ClockIcon className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Invitations en attente</h1>

        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{invitation.companyName}</h3>
                  <p className="text-sm text-gray-500">{invitation.email}</p>
                  <p className="text-sm text-gray-500">Rôle: {invitation.role}</p>
                </div>
                {invitation.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvitation(invitation)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    invitation.status === 'accepted' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {invitation.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                  </span>
                )}
              </div>
            </div>
          ))}

          {invitations.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Aucune invitation en attente
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 