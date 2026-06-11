import { useModuleStore } from '@/store/moduleStore.js';
import { hasPermission as checkPermission } from '@/config/permission.config.js';

/**
 * Custom hook to verify permissions for the currently active tenant member.
 * 
 * @returns {Object} Object containing the role, permissions array, and check function
 */
export function usePermissions() {
  const user = useModuleStore((s) => s.user);
  const activeTenant = useModuleStore((s) => s.activeTenant);
  const activePermissions = useModuleStore((s) => s.activePermissions);

  const role = activeTenant?.role?.code || 'owner';

  const hasPermission = (permission) => {
    if (!permission) return true;

    // Super admin bypasses all permission restrictions
    if (user?.isSuperAdmin) return true;

    // Check database-driven permissions list
    if (activePermissions.includes('*') || activePermissions.includes(permission)) return true;

    const namespace = permission.split('.')[0];
    if (activePermissions.includes(`${namespace}.*`)) return true;

    // Fallback to local configuration if DB permissions are empty
    if (!activePermissions || activePermissions.length === 0) {
      return checkPermission({ role }, permission);
    }

    return false;
  };

  return {
    permissions: activePermissions,
    role,
    hasPermission,
  };
}

export default usePermissions;
