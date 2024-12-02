'use client';

import { useState } from 'react';
import { Plus, FileText, Edit, Copy, Trash2 } from 'lucide-react';
import type { PDFTemplate } from '@/types/pdf';
import { usePDFTemplates } from '@/hooks/usePDFTemplates';
import { defaultTemplate } from '@/types/pdf';
import { PDFEditorModal } from '@/components/PDFEditor';

export function PDFTemplatesTab() {
  const { templates, loading, error, saveTemplate, deleteTemplate } = usePDFTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;
    await deleteTemplate(templateId);
  };

  const handleDuplicateTemplate = async (template: PDFTemplate) => {
    const newTemplate: PDFTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (copie)`,
    };
    await saveTemplate(newTemplate);
  };

  const handleSaveTemplate = async (template: PDFTemplate) => {
    await saveTemplate(template);
    setEditMode(false);
    setSelectedTemplate(null);
  };

  if (loading) {
    return <div className="p-8">Chargement des templates...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates PDF</h2>
          <p className="mt-2 text-gray-500">
            Gérez vos modèles de documents PDF
          </p>
        </div>
        <button
          onClick={() => {
            const newTemplate: PDFTemplate = {
              ...defaultTemplate,
              id: `template-${Date.now()}`,
              name: 'Nouveau template',
              description: 'Nouveau template personnalisé'
            };
            setSelectedTemplate(newTemplate);
            setEditMode(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border hover:border-blue-500 transition-colors group"
          >
            <div className="aspect-[210/297] relative bg-gray-50 rounded-t-lg border-b">
              <div className="absolute inset-0 p-4">
                <div 
                  className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: template.styles.colors.primary + '10'
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="text-lg font-bold"
                      style={{ color: template.styles.colors.primary }}
                    >
                      {template.header.title}
                    </div>
                    {template.header.subtitle && (
                      <div className="text-sm text-gray-500">
                        {template.header.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setEditMode(true);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                  title="Modifier"
                >
                  <Edit className="h-5 w-5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                  title="Dupliquer"
                >
                  <Copy className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{template.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{template.description}</p>
            </div>
          </div>
        ))}
      </div>

      {editMode && selectedTemplate && (
        <PDFEditorModal 
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setEditMode(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
} 