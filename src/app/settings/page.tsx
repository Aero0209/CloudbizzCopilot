'use client';

import React from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { Bell, Lock, Eye, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <MasterLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Paramètres</h1>

        <div className="max-w-2xl space-y-6">
          {/* Sécurité */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <h2 className="text-lg font-medium">Sécurité</h2>
                <p className="text-sm text-gray-500">
                  Gérez vos paramètres de sécurité
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                <div className="font-medium">Changer le mot de passe</div>
                <div className="text-sm text-gray-500">
                  Mettez à jour votre mot de passe
                </div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <h2 className="text-lg font-medium">Notifications</h2>
                <p className="text-sm text-gray-500">
                  Gérez vos préférences de notifications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Notifications par email</div>
                  <div className="text-sm text-gray-500">
                    Recevez des notifications par email
                  </div>
                </div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
} 