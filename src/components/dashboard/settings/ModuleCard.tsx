'use client';

import { SystemModule } from '@/types/modules';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronDown, 
  ChevronUp,
  Package,
  FileText,
  TicketIcon,
  MessageSquare,
  Box
} from 'lucide-react';
import { useState } from 'react';
import { ModuleSetting } from './ModuleSetting';
import { useModulesContext } from '@/providers/ModulesProvider';

const moduleIcons = {
  billing: FileText,
  ticketing: TicketIcon,
  support: MessageSquare,
  inventory: Box
} as const;

interface ModuleCardProps {
  module: SystemModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = moduleIcons[module.key] || Package;
  const { toggleModule, updateModuleSettings } = useModulesContext();

  const handleToggleModule = async (enabled: boolean) => {
    try {
      await toggleModule(module.id, enabled);
    } catch (error) {
      console.error('Erreur lors de la modification du module:', error);
    }
  };

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    const updatedFeatures = module.features.map(feature => 
      feature.id === featureId 
        ? { ...feature, isEnabled: enabled }
        : feature
    );

    try {
      await updateModuleSettings(module.id, {
        ...module.settings,
        features: updatedFeatures
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la fonctionnalité:', error);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      await updateModuleSettings(module.id, {
        ...module.settings,
        [key]: value
      });
    } catch (error) {
      console.error('Erreur lors de la modification du paramètre:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{module.name}</h3>
              <p className="text-sm text-gray-500">{module.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={module.isEnabled}
              onCheckedChange={handleToggleModule}
            />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 border-t pt-6">
            <div className="grid gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Fonctionnalités</h4>
                <div className="space-y-3">
                  {module.features.map(feature => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        <p className="text-sm text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={(checked) => 
                          handleToggleFeature(feature.id, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Paramètres</h4>
                <div className="space-y-4">
                  {Object.entries(module.settings).map(([key, value]) => (
                    <ModuleSetting
                      key={key}
                      name={key}
                      value={value}
                      onChange={(newValue) => 
                        handleUpdateSetting(key, newValue)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 