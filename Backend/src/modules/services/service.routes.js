import { Router } from 'express';
import {
  handleListCategories,
  handleGetCategory,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  handleListServices,
  handleGetService,
  handleCreateService,
  handleUpdateService,
  handleDeleteService,
  handleListAddons,
  handleGetAddon,
  handleCreateAddon,
  handleUpdateAddon,
  handleDeleteAddon,
  handleListBundles,
  handleGetBundle,
  handleCreateBundle,
  handleUpdateBundle,
  handleDeleteBundle,
} from './service.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant);

// Services
router.get('/', requirePermission('service.view'), handleListServices);
router.post('/', requirePermission('service.create'), handleCreateService);

// Categories
router.get('/categories', requirePermission('service.view'), handleListCategories);
router.get('/categories/:id', requirePermission('service.view'), handleGetCategory);
router.post('/categories', requirePermission('service.create'), handleCreateCategory);
router.put('/categories/:id', requirePermission('service.update'), handleUpdateCategory);
router.delete('/categories/:id', requirePermission('service.delete'), handleDeleteCategory);

// Addons
router.get('/addons', requirePermission('service.view'), handleListAddons);
router.get('/addons/:id', requirePermission('service.view'), handleGetAddon);
router.post('/addons', requirePermission('service.create'), handleCreateAddon);
router.put('/addons/:id', requirePermission('service.update'), handleUpdateAddon);
router.delete('/addons/:id', requirePermission('service.delete'), handleDeleteAddon);

// Bundles
router.get('/bundles', requirePermission('service.view'), handleListBundles);
router.get('/bundles/:id', requirePermission('service.view'), handleGetBundle);
router.post('/bundles', requirePermission('service.create'), handleCreateBundle);
router.put('/bundles/:id', requirePermission('service.update'), handleUpdateBundle);
router.delete('/bundles/:id', requirePermission('service.delete'), handleDeleteBundle);

router.get('/:id', requirePermission('service.view'), handleGetService);
router.put('/:id', requirePermission('service.update'), handleUpdateService);
router.delete('/:id', requirePermission('service.delete'), handleDeleteService);

export default router;
