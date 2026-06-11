/**
 * Express middleware to check if a specific module is active for the current tenant.
 * Requires resolveTenant middleware to be executed first.
 * 
 * @param {string} moduleCode - Code of the module to verify (e.g. "bookings", "payments", "pos")
 * @returns {import('express').RequestHandler}
 */
export function requireModule(moduleCode) {
  return (req, res, next) => {
    try {
      const tenant = req.tenant;
      if (!tenant) {
        return res.status(500).json({ error: 'Tenant context is missing. Ensure resolveTenant runs first.' });
      }

      // 1. Check if module is allowed in PlanModule records.
      const planModules = tenant.plan?.planModules || [];
      const isAllowedInPlan = planModules.some(
        (planModule) => planModule.enabled && planModule.module?.code === moduleCode
      );

      // 2. Check if there is a TenantModule override (e.g., custom enable or billing override)
      const overrides = tenant.modules || [];
      const overrideRecord = overrides.find((tenantModule) => tenantModule.module?.code === moduleCode);

      // Access is granted if it is allowed in plan OR explicitly enabled via override
      // and not explicitly disabled via override.
      let hasAccess = isAllowedInPlan;
      if (overrideRecord) {
        hasAccess = overrideRecord.enabled;
      }

      if (!hasAccess) {
        return res.status(403).json({
          error: `Module '${moduleCode}' is not active on your current subscription plan. Please upgrade to unlock this feature.`
        });
      }

      next();
    } catch (error) {
      console.error('Subscription Check Error:', error);
      return res.status(500).json({ error: 'Module validation error.' });
    }
  };
}
