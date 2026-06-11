import { create } from 'zustand';
import { getModulesForPlan } from '../config/module.config.js';

const STORAGE_KEYS = {
  token: 'trimly_token',
  user: 'trimly_user',
  activeTenantId: 'trimly_active_tenant_id',
  activeTenant: 'trimly_active_tenant',
  availableTenants: 'trimly_available_tenants',
};

const storedTenant = getStoredTenant();
const storedUser = getStoredUser();
const storedAvailableTenants = getStoredAvailableTenants();

/**
 * Zustand store to manage user authentication, active tenant profile, 
 * active tenant modules, and permissions for dynamic sidebar rendering.
 */
export const useModuleStore = create((set) => ({
  user: storedUser,
  activeTenant: storedTenant,
  availableTenants: storedAvailableTenants,
  activeModules: storedTenant ? (storedTenant.activeModules || getModulesForPlan(storedTenant.planCode)) : [],
  activePermissions: storedTenant ? (storedTenant.permissions || []) : [],
  token: getStoredToken(),

  /**
   * Set user session after successful login.
   * 
   * @param {Object} payload
   * @param {Object} payload.user - Auth user object
   * @param {string} payload.token - Auth JWT token
   * @param {Array} payload.tenants - List of tenant memberships
   */
  login: (payload) => {
    // Store in localStorage for session persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.token, payload.token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(payload.user));
      localStorage.setItem(STORAGE_KEYS.availableTenants, JSON.stringify(payload.tenants || []));
      if (payload.tenants?.[0]) {
        localStorage.setItem(STORAGE_KEYS.activeTenantId, payload.tenants[0].id);
        localStorage.setItem(STORAGE_KEYS.activeTenant, JSON.stringify(payload.tenants[0]));
      }
    }
    
    // Default to the first tenant as active
    const primaryTenant = payload.tenants?.[0] || null;

    set({
      user: payload.user,
      token: payload.token,
      availableTenants: payload.tenants || [],
      activeTenant: primaryTenant,
      activeModules: primaryTenant ? (primaryTenant.activeModules || getModulesForPlan(primaryTenant.planCode)) : [],
      activePermissions: primaryTenant ? (primaryTenant.permissions || []) : [],
    });
  },

  /**
   * Switch active tenant context.
   * 
   * @param {string} tenantId
   */
  switchTenant: (tenantId) => {
    set((state) => {
      const tenant = state.availableTenants.find(t => t.id === tenantId);
      if (!tenant) return state;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.activeTenantId, tenant.id);
        localStorage.setItem(STORAGE_KEYS.activeTenant, JSON.stringify(tenant));
      }

      return {
        activeTenant: tenant,
        activeModules: tenant.activeModules || getModulesForPlan(tenant.planCode),
        activePermissions: tenant.permissions || [],
      };
    });
  },

  /**
   * Log out and clear state.
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.activeTenantId);
      localStorage.removeItem(STORAGE_KEYS.activeTenant);
      localStorage.removeItem(STORAGE_KEYS.availableTenants);
    }
    set({
      user: null,
      activeTenant: null,
      availableTenants: [],
      activeModules: [],
      activePermissions: [],
      token: null,
    });
  },
}));

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.token);
}

function getStoredTenant() {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEYS.activeTenant);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEYS.user);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getStoredAvailableTenants() {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.availableTenants);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}
