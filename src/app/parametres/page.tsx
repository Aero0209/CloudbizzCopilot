'use client';

import React from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ParametresPage() {
  return (
    <MasterLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {/* Paramètres généraux */}
          </TabsContent>
          
          <TabsContent value="security">
            {/* Paramètres de sécurité */}
          </TabsContent>

          {/* Autres onglets... */}
        </Tabs>
      </div>
    </MasterLayout>
  );
} 