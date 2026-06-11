export const ROLE_PERMISSIONS = {
  SUPERADMIN: ['*'],
  SUPER_ADMIN: ['*'],
  OWNER: ['*'],
  ADMIN: ['*'],
  STAFF: [
    'staff.dashboard.view',
    'staff.bookings.view',
    'booking.view',
    'booking.update',
    'staff.customers.view',
    'customer.view',
    'staff.attendance.manage',
    'staff.performance.view',
    'staff.commission.view',
    'staff.payroll.view',
    'staff.notifications.view',
  ],
  SUPPLIER: [
    'suppliers.view',
    'inventory.view',
    'payments.view',
  ],
  RECEPTIONIST: [
    'dashboard.view',
    'booking.view',
    'bookings.view',
    'booking.create',
    'booking.update',
    'booking.delete',
    'booking.checkin',
    'booking.billing',
    'customer.view',
    'customers.view',
    'customer.manage',
    'staff.view',
    'service.view',
    'payment.view',
    'payments.view',
    'payment.manage',
  ],
};

/**
 * Extracts and normalizes the user's role code.
 * 
 * @param {Object} user 
 * @returns {string} Normalized uppercase role code
 */
export function getUserRole(user) {
  const rawRole = user?.role?.code || user?.role || user?.membership?.role?.code || user?.membership?.role || 'owner';
  return String(rawRole).toUpperCase();
}

/**
 * Validates if the user possesses the required permission.
 * 
 * @param {Object} user 
 * @param {string} permission - e.g., 'booking.create'
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!permission) return true;

  // Global Super Admin bypass
  if (user?.isSuperAdmin) return true;

  // Use dynamic permissions list if provided and non-empty, otherwise fallback to static role mapping
  const permissions = (user?.permissions && user.permissions.length > 0)
    ? user.permissions
    : (ROLE_PERMISSIONS[getUserRole(user)] || ROLE_PERMISSIONS.OWNER);
  
  if (permissions.includes('*') || permissions.includes(permission)) return true;

  const namespace = permission.split('.')[0];
  return permissions.includes(`${namespace}.*`);
}
