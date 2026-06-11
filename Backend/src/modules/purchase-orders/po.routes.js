import { Router } from 'express';
import {
  handleListPOs,
  handleGetPO,
  handleCreatePO,
  handleUpdatePO,
  handleDeletePO,
  handleApprovePO,
  handleSendPO,
} from './po.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', requirePermission('supplier.view'), handleListPOs);
router.get('/:id', requirePermission('supplier.view'), handleGetPO);
router.post('/', requirePermission('supplier.manage'), handleCreatePO);
router.put('/:id', requirePermission('supplier.manage'), handleUpdatePO);
router.delete('/:id', requirePermission('supplier.manage'), handleDeletePO);

router.post('/:id/approve', requirePermission('supplier.manage'), handleApprovePO);
router.post('/:id/send', requirePermission('supplier.manage'), handleSendPO);

export default router;
