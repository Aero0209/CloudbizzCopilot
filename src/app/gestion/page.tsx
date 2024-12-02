'use client';

import { useState } from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceValidationSetting from '@/components/dashboard/settings/ServiceValidationSetting';
import ModulesManager from '@/components/dashboard/settings/ModulesManager';
import { Settings, Package, Bell, Shield, Blocks, FileText } from 'lucide-react';
import { PDFTemplatesTab } from '@/components/dashboard/settings/PDFTemplatesTab';

export default function GestionPage() {
  return (
    <MasterLayout>
      <div className="p-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-gray-500">
            Gérez les paramètres globaux de la plateforme
          </p>
        </div>

        {/* Onglets de paramètres */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="modules" className="gap-2">
              <Blocks className="w-4 h-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Package className="w-4 h-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <FileText className="w-4 h-4" />
              Templates PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <ModulesManager />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6">
              {/* Paramètre de validation des services */}
              <ServiceValidationSetting />

              {/* Autres paramètres de services */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Autres paramètres de services
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configuration supplémentaire des services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            {/* Contenu des paramètres de notifications */}
          </TabsContent>

          <TabsContent value="security">
            {/* Contenu des paramètres de sécurité */}
          </TabsContent>

          <TabsContent value="pdf">
            <PDFTemplatesTab />
          </TabsContent>
        </Tabs>
      </div>
    </MasterLayout>
  );
}