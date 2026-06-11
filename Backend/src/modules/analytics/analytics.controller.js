import * as analyticsService from './analytics.service.js';

/**
 * Endpoint to fetch main dashboard KPIs.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetDashboard(req, res) {
  try {
    const data = await analyticsService.getDashboardMetrics(req.tenant.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch dashboard metrics.' });
  }
}

/**
 * Endpoint to fetch earnings summary.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetEarnings(req, res) {
  try {
    const data = await analyticsService.getEarningsSummary(req.tenant.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch earnings summary.' });
  }
}

/**
 * Endpoint to fetch appointments summary.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetAppointments(req, res) {
  try {
    const data = await analyticsService.getAppointmentsSummary(req.tenant.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch appointments summary.' });
  }
}

/**
 * Endpoint to fetch customers breakdown.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetCustomers(req, res) {
  try {
    const data = await analyticsService.getCustomersSummary(req.tenant.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch customers summary.' });
  }
}

/**
 * Endpoint to fetch services performance.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetServices(req, res) {
  try {
    const data = await analyticsService.getServicePerformance(req.tenant.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch service metrics.' });
  }
}

/**
 * Endpoint to fetch staff workload percentages.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetStaff(req, res) {
  try {
    const data = await analyticsService.getStaffWorkload(req.tenant.id);
    return res.status(200).json({ staff_workload: data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch staff workloads.' });
  }
}

/**
 * Endpoint to fetch staff performance aggregated metrics.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetStaffPerformance(req, res) {
  try {
    const data = await analyticsService.getStaffPerformance(req.tenant.id);
    return res.status(200).json({ staff_performance: data });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch staff performance.' });
  }
}

export default {
  handleGetDashboard,
  handleGetEarnings,
  handleGetAppointments,
  handleGetCustomers,
  handleGetServices,
  handleGetStaff,
  handleGetStaffPerformance,
};
