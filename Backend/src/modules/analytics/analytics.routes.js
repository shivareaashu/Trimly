import { Router } from 'express';
import {
  handleGetDashboard,
  handleGetEarnings,
  handleGetAppointments,
  handleGetCustomers,
  handleGetServices,
  handleGetStaff,
  handleGetStaffPerformance
} from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

// Apply auth, tenant scoping, and module checks to all analytics endpoints
router.use(authenticate, resolveTenant, requireModule('analytics'), requirePermission('analytics.view'));

router.get('/dashboard', handleGetDashboard);
router.get('/revenue', handleGetEarnings); // Mapping /revenue endpoint to handleGetEarnings
router.get('/bookings', handleGetAppointments);
router.get('/customers', handleGetCustomers);
router.get('/services', handleGetServices);
router.get('/staff', handleGetStaff);
router.get('/staff-performance', handleGetStaffPerformance);

export default router;
