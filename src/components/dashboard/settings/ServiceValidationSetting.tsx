'use client';

import { Switch } from '@/components/ui/switch';
import { useServiceValidationSettings } from '@/hooks/useServiceValidationSettings';
import { Clock, Loader2 } from 'lucide-react';

export default function ServiceValidationSetting() {
  const { isLoading, requireValidation, error, updateValidationSetting } = useServiceValidationSettings();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Chargement des paramètres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Validation des services
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Exiger une validation manuelle avant l'activation des services
          </p>
        </div>
        <Switch
          checked={requireValidation}
          onCheckedChange={updateValidationSetting}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {requireValidation 
            ? "Les nouveaux services seront en attente de validation avant d'être activés."
            : "Les nouveaux services seront automatiquement activés lors de leur création."}
        </p>
      </div>
    </div>
  );
} 