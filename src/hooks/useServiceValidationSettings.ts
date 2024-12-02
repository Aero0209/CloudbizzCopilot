import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useServiceValidationSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [requireValidation, setRequireValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'service-validation'));
        if (settingsDoc.exists()) {
          setRequireValidation(settingsDoc.data().requireServiceValidation);
        }
      } catch (err) {
        setError('Erreur lors du chargement des paramètres');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateValidationSetting = async (newValue: boolean) => {
    try {
      await setDoc(doc(db, 'settings', 'service-validation'), {
        requireServiceValidation: newValue,
        updatedAt: new Date()
      });
      setRequireValidation(newValue);
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres');
      console.error(err);
      return false;
    }
  };

  return {
    isLoading,
    requireValidation,
    error,
    updateValidationSetting
  };
} 