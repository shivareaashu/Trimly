import { Router } from 'express';
import {
  handleListCategories,
  handleGetCategory,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleListItems,
  handleGetItem,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
  handleAdjustStock,
} from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant);

// Categories
router.get('/categories', requirePermission('inventory.view'), handleListCategories);
router.get('/categories/:id', requirePermission('inventory.view'), handleGetCategory);
router.post('/categories', requirePermission('inventory.manage'), handleCreateCategory);
router.put('/categories/:id', requirePermission('inventory.manage'), handleUpdateCategory);
router.delete('/categories/:id', requirePermission('inventory.manage'), handleDeleteCategory);

// Items
router.get('/items', requirePermission('inventory.view'), handleListItems);
router.get('/items/:id', requirePermission('inventory.view'), handleGetItem);
router.post('/items', requirePermission('inventory.manage'), handleCreateItem);
router.put('/items/:id', requirePermission('inventory.manage'), handleUpdateItem);
router.delete('/items/:id', requirePermission('inventory.manage'), handleDeleteItem);

// Adjustments
router.post('/adjustments', requirePermission('inventory.manage'), handleAdjustStock);

export default router;
