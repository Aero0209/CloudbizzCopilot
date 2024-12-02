'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface InvitationData {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: string;
  expiresAt: Timestamp;
}

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function InvitationPage({ params }: { params: { id: string } }) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const invitationDoc = await getDoc(doc(db, 'invitations', params.id));
        
        if (!invitationDoc.exists()) {
          setError('Cette invitation n\'existe pas ou a expiré');
          return;
        }

        const data = invitationDoc.data() as InvitationData;
        
        // Vérifier si l'invitation a expiré
        if (data.expiresAt.toDate() < new Date()) {
          setError('Cette invitation a expiré');
          return;
        }

        // Vérifier si l'invitation est déjà acceptée ou rejetée
        if (data.status !== 'pending') {
          setError('Cette invitation a déjà été traitée');
          return;
        }

        setInvitation(data);
        setFormData(prev => ({ ...prev, email: data.email }));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'invitation:', error);
        setError('Une erreur est survenue lors du chargement de l\'invitation');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [params.id]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    try {
      setLoading(true);
      setError(null);

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Créer le profil utilisateur
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: formData.email,
          companyId: invitation.companyId,
          role: invitation.role,
          createdAt: new Date()
        });
      }

      // Mettre à jour l'invitation
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'accepted'
      });

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation non valide</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Invitation à rejoindre {invitation.companyName}</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            Vous avez été invité(e) à rejoindre <strong>{invitation.companyName}</strong> en tant que <strong>{invitation.role}</strong>.
          </p>
          <p className="text-gray-600">
            Cette invitation expire le {invitation.expiresAt.toDate().toLocaleDateString('fr-FR')}.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Créer un nouveau compte' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 