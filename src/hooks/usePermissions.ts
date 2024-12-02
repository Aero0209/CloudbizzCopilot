import { useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Permission, checkPermission } from '@/types/permissions';
import type { UserProfile } from '@/types';

export function usePermissions() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile) return false;
    return checkPermission(userProfile.role, permission);
  };

  return {
    loading,
    userProfile,
    hasPermission
  };
} 