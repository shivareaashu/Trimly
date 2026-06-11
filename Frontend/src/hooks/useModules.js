import { useModuleStore } from '@/store/moduleStore.js';
import { isModuleEnabled } from '@/config/module.config.js';

/**
 * Custom hook to verify if a feature module is enabled for the active tenant.
 * 
 * @returns {Object} Object containing active modules list and check function
 */
export function useModules() {
  const activeModules = useModuleStore((s) => s.activeModules);

  const hasModule = (moduleKey) => {
    return isModuleEnabled(moduleKey, activeModules);
  };

  return {
    activeModules,
    hasModule,
  };
}

export default useModules;
