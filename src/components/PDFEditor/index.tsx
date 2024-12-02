'use client';

import React from 'react';
import { PDFEditor } from './PDFEditor';
import type { PDFTemplate } from '../../types/pdf';

interface PDFEditorModalProps {
  template: PDFTemplate;
  onSave: (template: PDFTemplate) => Promise<void>;
  onCancel: () => void;
}

export function PDFEditorModal({ template, onSave, onCancel }: PDFEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[1400px] h-[90vh] my-4">
        <PDFEditor 
          template={template}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}

export { PDFEditor }; 