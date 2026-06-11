import { Router } from 'express';
import {
  handleListStaff,
  handleGetStaff,
  handleCreateStaff,
  handleUpdateStaff,
  handleDeleteStaff
} from './staff.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant, requireModule('staff'));

router.get('/', requirePermission('staff.view'), handleListStaff);
router.get('/:id', requirePermission('staff.view'), handleGetStaff);
router.post('/', requirePermission('staff.manage'), handleCreateStaff);
router.put('/:id', requirePermission('staff.manage'), handleUpdateStaff);
router.delete('/:id', requirePermission('staff.manage'), handleDeleteStaff);

export default router;
