import { Router } from 'express';
import {
  handleGeneratePayroll,
  handleApprovePayroll,
  handlePayPayroll,
  handleListPayroll,
} from './payroll.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant, requireModule('staff'));

router.post('/generate', requirePermission('staff.manage'), handleGeneratePayroll);
router.put('/approve/:id', requirePermission('staff.manage'), handleApprovePayroll);
router.put('/pay/:id', requirePermission('staff.manage'), handlePayPayroll);
router.get('/', requirePermission('staff.view'), handleListPayroll);

export default router;
