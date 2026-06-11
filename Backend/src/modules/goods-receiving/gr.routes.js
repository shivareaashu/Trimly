import { Router } from 'express';
import {
  handleListReceipts,
  handleGetReceipt,
  handleReceiveGoods,
} from './gr.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', requirePermission('inventory.view'), handleListReceipts);
router.get('/:id', requirePermission('inventory.view'), handleGetReceipt);
router.post('/', requirePermission('inventory.manage'), handleReceiveGoods);

export default router;
