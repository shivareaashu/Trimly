import { Router } from 'express';
import {
  handleCreateExpense,
  handleUpdateExpense,
  handleDeleteExpense,
  handleListExpenses,
} from './expense.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

// Require authenticated tenant context
router.use(authenticate, resolveTenant, requireModule('payments'));

router.post('/', requirePermission('billing.manage'), handleCreateExpense);
router.put('/:id', requirePermission('billing.manage'), handleUpdateExpense);
router.delete('/:id', requirePermission('billing.manage'), handleDeleteExpense);
router.get('/', requirePermission('payment.view'), handleListExpenses);

export default router;
