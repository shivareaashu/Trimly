import { Router } from 'express';
import {
  handleListCustomers,
  handleGetCustomer,
  handleCreateCustomer,
  handleUpdateCustomer,
  handleRecalculateCustomer,
  handleGetCustomerTimeline,
  handleGetLoyalty,
  handleAdjustLoyalty,
  handleGetMembershipPlans,
  handlePurchaseMembership,
  handleCustomersDueForRevisit,
  handleRefreshLifecycle
} from './customer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

// Apply auth and tenant resolution to all customer routes
router.use(authenticate, resolveTenant, requireModule('customers'));

router.get(
  '/',
  requirePermission('customer.view'),
  handleListCustomers
);

router.get(
  '/membership-plans',
  requirePermission('customer.view'),
  handleGetMembershipPlans
);

router.get(
  '/revisit/due',
  requirePermission('customer.view'),
  handleCustomersDueForRevisit
);

router.post(
  '/lifecycle/refresh',
  requirePermission('customer.manage'),
  handleRefreshLifecycle
);

router.get(
  '/:id',
  requirePermission('customer.view'),
  handleGetCustomer
);

router.post(
  '/',
  requirePermission('customer.manage'),
  handleCreateCustomer
);

router.put(
  '/:id',
  requirePermission('customer.manage'),
  handleUpdateCustomer
);

router.post(
  '/:id/recalculate',
  requirePermission('customer.manage'),
  handleRecalculateCustomer
);

router.get(
  '/:id/timeline',
  requirePermission('customer.view'),
  handleGetCustomerTimeline
);

router.get(
  '/:id/loyalty',
  requirePermission('customer.view'),
  handleGetLoyalty
);

router.post(
  '/:id/loyalty/adjust',
  requirePermission('customer.manage'),
  handleAdjustLoyalty
);

router.post(
  '/:id/memberships',
  requirePermission('customer.manage'),
  handlePurchaseMembership
);

export default router;
