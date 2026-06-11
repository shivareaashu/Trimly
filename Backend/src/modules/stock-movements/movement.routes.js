import { Router } from 'express';
import {
  handleListMovements,
  handleGetMovement,
} from './movement.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', requirePermission('inventory.view'), handleListMovements);
router.get('/:id', requirePermission('inventory.view'), handleGetMovement);

export default router;
