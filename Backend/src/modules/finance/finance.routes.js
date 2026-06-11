import { Router } from 'express';
import { handleGetFinancialSummary } from './finance.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant, requireModule('payments'));

router.get('/summary', requirePermission('payment.view'), handleGetFinancialSummary);

export default router;
