'use client';

import { Switch } from '@/components/ui/switch';

interface ModuleSettingProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
}

export function ModuleSetting({ name, value, onChange }: ModuleSettingProps) {
  const renderSettingInput = () => {
    switch (typeof value) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={onChange}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          />
        );
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">
          {typeof value === 'boolean' 
            ? `${name} est ${value ? 'activé' : 'désactivé'}`
            : `Valeur actuelle : ${value}`
          }
        </p>
      </div>
      {renderSettingInput()}
    </div>
  );
} 