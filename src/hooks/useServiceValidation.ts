import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useServiceValidation() {
  const [requireValidation, setRequireValidation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'service-validation'));
        if (settingsDoc.exists()) {
          setRequireValidation(settingsDoc.data().requireServiceValidation);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { requireValidation, loading };
} 