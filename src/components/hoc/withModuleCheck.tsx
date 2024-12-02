import { useModules } from '@/hooks/useModules';
import type { ModuleKey } from '@/types/modules';
import { ModuleDisabledPage } from '../ModuleDisabledPage';

export function withModuleCheck(
  WrappedComponent: React.ComponentType,
  moduleKey: ModuleKey
) {
  return function WithModuleCheckComponent(props: any) {
    const { isModuleEnabled } = useModules();

    if (!isModuleEnabled(moduleKey)) {
      return <ModuleDisabledPage moduleKey={moduleKey} />;
    }

    return <WrappedComponent {...props} />;
  };
} 