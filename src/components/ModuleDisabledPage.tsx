import { ModuleKey } from '@/types/modules';
import { PackageX } from 'lucide-react';

interface ModuleDisabledPageProps {
  moduleKey: ModuleKey;
}

export function ModuleDisabledPage({ moduleKey }: ModuleDisabledPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
          <PackageX className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Module non disponible
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Le module {moduleKey} est actuellement désactivé. 
          Contactez votre administrateur pour l'activer.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour
        </button>
      </div>
    </div>
  );
} 