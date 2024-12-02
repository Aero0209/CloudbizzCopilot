'use client';

import React, { useState } from 'react';
import { X, Save, Upload, Layout, Type, Palette, Eye } from 'lucide-react';
import type { PDFTemplate } from '@/types/pdf';
import { ChromePicker } from 'react-color';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PDFEditorProps {
  template: PDFTemplate;
  onSave: (template: PDFTemplate) => Promise<void>;
  onCancel: () => void;
}

// Ajouter le composant PDFPreview
const PDFPreview = ({ template }: { template: PDFTemplate }) => (
  <div className="aspect-[210/297] p-8 bg-white shadow-sm rounded-lg"
    style={{ 
      color: template.styles.colors.text,
      fontFamily: template.styles.fonts.body
    }}
  >
    {/* En-tête */}
    {template.sections.header && (
      <div className="text-center mb-8">
        {template.header.logo && (
          <img 
            src={template.header.logo} 
            alt="Logo" 
            className="h-16 mx-auto mb-4 object-contain"
          />
        )}
        <h1 
          className="text-2xl font-bold"
          style={{ 
            color: template.styles.colors.primary,
            fontFamily: template.styles.fonts.header
          }}
        >
          {template.header.title}
        </h1>
        {template.header.subtitle && (
          <p className="mt-2 text-sm">{template.header.subtitle}</p>
        )}
      </div>
    )}

    {/* Informations client */}
    {template.sections.customerInfo && (
      <div className="mb-8">
        <h2 
          className="text-lg font-semibold mb-2"
          style={{ 
            color: template.styles.colors.secondary,
            fontFamily: template.styles.fonts.header
          }}
        >
          Informations client
        </h2>
        <div className="text-sm space-y-1">
          <p>Nom de l'entreprise</p>
          <p>123 rue Example</p>
          <p>75000 Paris</p>
          <p>contact@example.com</p>
        </div>
      </div>
    )}

    {/* Services */}
    {template.sections.services && (
      <div className="mb-8">
        <h2 
          className="text-lg font-semibold mb-4"
          style={{ 
            color: template.styles.colors.secondary,
            fontFamily: template.styles.fonts.header
          }}
        >
          Services
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Service 1</span>
            <span>100.00€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service 2</span>
            <span>150.00€</span>
          </div>
        </div>
      </div>
    )}

    {/* Total */}
    {template.sections.total && (
      <div className="border-t pt-4">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>250.00€</span>
        </div>
      </div>
    )}

    {/* Footer */}
    {template.sections.footer && (
      <div className="absolute bottom-8 left-8 right-8 text-center text-sm text-gray-500">
        Cloudbizz SRL - Solutions Cloud pour Entreprise
      </div>
    )}
  </div>
);

export function PDFEditor({ template: initialTemplate, onSave, onCancel }: PDFEditorProps) {
  const [template, setTemplate] = useState<PDFTemplate>(initialTemplate);
  const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'secondary' | 'text' | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(template);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplate(prev => ({
          ...prev,
          header: {
            ...prev.header,
            logo: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full">
      {/* Panneau de configuration */}
      <div className="w-[400px] border-r flex flex-col">
        <Tabs defaultValue="general" className="flex-1">
          <TabsList className="w-full justify-start p-2 bg-gray-50 border-b">
            <TabsTrigger value="general" className="gap-2">
              <Layout className="h-4 w-4" />
              Général
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2">
              <Palette className="h-4 w-4" />
              Style
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Type className="h-4 w-4" />
              Contenu
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* Onglet Général */}
            <TabsContent value="general" className="p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du template</label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {template.header.logo ? (
                    <div className="space-y-4">
                      <img 
                        src={template.header.logo} 
                        alt="Logo" 
                        className="h-20 mx-auto"
                      />
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setTemplate(prev => ({
                            ...prev,
                            header: { ...prev.header, logo: undefined }
                          }))}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Supprimer
                        </button>
                        <label className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded cursor-pointer">
                          Changer
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block p-4">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Cliquez pour ajouter un logo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Onglet Style */}
            <TabsContent value="style" className="p-4 space-y-6">
              <div>
                <h3 className="font-medium mb-4">Couleurs</h3>
                <div className="space-y-4">
                  {Object.entries(template.styles.colors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {key}
                      </label>
                      <button
                        onClick={() => setActiveColorPicker(key as any)}
                        className="w-full h-10 rounded border flex items-center px-3 gap-2"
                      >
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: value }}
                        />
                        <span>{value}</span>
                      </button>
                      {activeColorPicker === key && (
                        <div className="absolute mt-2 z-50">
                          <div
                            className="fixed inset-0"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                            color={value}
                            onChange={color => {
                              setTemplate(prev => ({
                                ...prev,
                                styles: {
                                  ...prev.styles,
                                  colors: {
                                    ...prev.styles.colors,
                                    [key]: color.hex
                                  }
                                }
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Onglet Contenu */}
            <TabsContent value="content" className="p-4 space-y-6">
              <div>
                <h3 className="font-medium mb-4">Sections visibles</h3>
                <div className="space-y-3">
                  {Object.entries(template.sections).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setTemplate(prev => ({
                          ...prev,
                          sections: {
                            ...prev.sections,
                            [key]: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-500" />
          <h4 className="font-medium">Aperçu</h4>
        </div>
        <div className="max-w-[595px] mx-auto">
          <PDFPreview template={template} />
        </div>
      </div>
    </div>
  );
} 