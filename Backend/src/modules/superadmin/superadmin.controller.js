import * as superAdminService from './superadmin.service.js';

export async function handleGetStats(req, res) {
  try {
    const stats = await superAdminService.getPlatformStats();
    return res.status(200).json({ stats });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch platform statistics.' });
  }
}

export async function handleListTenants(req, res) {
  try {
    const tenants = await superAdminService.listTenants();
    return res.status(200).json({ tenants });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list registered salons.' });
  }
}

export async function handleApproveTenant(req, res) {
  try {
    const tenant = await superAdminService.approveTenant(req.params.id);
    return res.status(200).json({
      message: 'Salon onboarding approved successfully.',
      tenant
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to approve onboarding.' });
  }
}

export async function handleListPlans(req, res) {
  try {
    const plans = await superAdminService.listPlans();
    return res.status(200).json({ plans });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch subscription plans.' });
  }
}
