import prisma from '../config/db.js';

/**
 * Express middleware to check if the authenticated user has a specific permission in the resolved tenant.
 * Requires authenticate and resolveTenant middlewares to run beforehand.
 * 
 * @param {string} permissionAction - The action permission to check (e.g., "booking.create")
 * @returns {import('express').RequestHandler}
 */
export function requirePermission(permissionAction) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const tenant = req.tenant;

      if (!user || !tenant) {
        return res.status(500).json({ error: 'Auth or Tenant context missing. Ensure authenticate and resolveTenant run first.' });
      }

      // 1. Super admin has bypass on everything
      if (user.isSuperAdmin) {
        return next();
      }

      // 2. Fetch user's membership for this tenant
      const member = await prisma.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId: tenant.id,
            userId: user.id,
          },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!member) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this tenant.' });
      }

      const role = member.role;

      // 3. Owners bypass all tenant permissions
      if (role.code === 'owner') {
        return next();
      }

      // 4. Check if role contains the required permission
      const hasPerm = role.permissions.some(
        rp => rp.permission.action === permissionAction
      );

      if (!hasPerm) {
        return res.status(403).json({ error: `Access denied. You do not have permission to perform '${permissionAction}'.` });
      }

      // Store resolved member profile and role details on request for controller usage
      req.member = member;
      next();
    } catch (error) {
      console.error('RBAC Permission Check Error:', error);
      return res.status(500).json({ error: 'Authorization validation error.' });
    }
  };
}
