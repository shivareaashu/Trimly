import { Router } from 'express';
import {
  handleListSuppliers,
  handleGetSupplier,
  handleCreateSupplier,
  handleUpdateSupplier,
  handleDeleteSupplier,
  handleAddContact,
  handleRemoveContact,
  handleAddDocument,
  handleRemoveDocument,
} from './supplier.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant);

// Supplier CRUD
router.get('/', requirePermission('supplier.view'), handleListSuppliers);
router.get('/:id', requirePermission('supplier.view'), handleGetSupplier);
router.post('/', requirePermission('supplier.manage'), handleCreateSupplier);
router.put('/:id', requirePermission('supplier.manage'), handleUpdateSupplier);
router.delete('/:id', requirePermission('supplier.manage'), handleDeleteSupplier);

// Contacts
router.post('/:supplierId/contacts', requirePermission('supplier.manage'), handleAddContact);
router.delete('/contacts/:id', requirePermission('supplier.manage'), handleRemoveContact);

// Documents
router.post('/:supplierId/documents', requirePermission('supplier.manage'), handleAddDocument);
router.delete('/documents/:id', requirePermission('supplier.manage'), handleRemoveDocument);

export default router;
