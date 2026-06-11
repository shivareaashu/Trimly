import { Router } from 'express';
import {
  handleGetStats,
  handleListTenants,
  handleApproveTenant,
  handleListPlans
} from './superadmin.controller.js';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../websites/templates/templates.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../../middleware/superadmin.middleware.js';

const router = Router();

// Apply auth and requireSuperAdmin middleware to all superadmin endpoints
router.use(authenticate, requireSuperAdmin);

router.get('/stats', handleGetStats);
router.get('/tenants', handleListTenants);
router.post('/approvals/:id/approve', handleApproveTenant);
router.get('/subscriptions', handleListPlans);

// Template management
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
