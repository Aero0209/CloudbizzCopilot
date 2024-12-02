'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { PDFTemplate } from '@/types/pdf';

export function usePDFTemplates() {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pdfTemplates'));
      const snapshot = await getDocs(q);
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PDFTemplate[];
      setTemplates(templatesData);
    } catch (err) {
      console.error('Erreur lors du chargement des templates:', err);
      setError("Erreur lors du chargement des templates");
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: PDFTemplate) => {
    try {
      await setDoc(doc(db, 'pdfTemplates', template.id), template);
      await loadTemplates();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du template:', err);
      throw new Error("Erreur lors de la sauvegarde du template");
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'pdfTemplates', templateId));
      await loadTemplates();
    } catch (err) {
      console.error('Erreur lors de la suppression du template:', err);
      throw new Error("Erreur lors de la suppression du template");
    }
  };

  return {
    templates,
    loading,
    error,
    saveTemplate,
    deleteTemplate,
    refresh: loadTemplates
  };
} 