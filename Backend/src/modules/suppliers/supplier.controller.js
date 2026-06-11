import * as supplierService from './supplier.service.js';
import { 
  createSupplierSchema, updateSupplierSchema, 
  createContactSchema, createDocumentSchema 
} from './supplier.validation.js';
import { z } from 'zod';

export async function handleListSuppliers(req, res) {
  try {
    const suppliers = await supplierService.getSuppliers(req.tenant.id);
    return res.status(200).json({ suppliers });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list suppliers.' });
  }
}

export async function handleGetSupplier(req, res) {
  try {
    const supplier = await supplierService.getSupplier(req.tenant.id, req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }
    return res.status(200).json({ supplier });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve supplier.' });
  }
}

export async function handleCreateSupplier(req, res) {
  try {
    const validatedData = createSupplierSchema.parse(req.body);
    const supplier = await supplierService.createSupplier(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Supplier registered successfully.',
      supplier,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to register supplier.' });
  }
}

export async function handleUpdateSupplier(req, res) {
  try {
    const validatedData = updateSupplierSchema.parse(req.body);
    const supplier = await supplierService.updateSupplier(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Supplier details updated successfully.',
      supplier,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update supplier.' });
  }
}

export async function handleDeleteSupplier(req, res) {
  try {
    await supplierService.deleteSupplier(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Supplier profile deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete supplier.' });
  }
}

export async function handleAddContact(req, res) {
  try {
    const validatedData = createContactSchema.parse(req.body);
    const contact = await supplierService.addContact(req.params.supplierId, validatedData);
    return res.status(201).json({
      message: 'Supplier representative contact added.',
      contact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to add contact.' });
  }
}

export async function handleRemoveContact(req, res) {
  try {
    await supplierService.removeContact(req.params.id);
    return res.status(200).json({ message: 'Supplier contact representative removed.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to remove contact.' });
  }
}

export async function handleAddDocument(req, res) {
  try {
    const validatedData = createDocumentSchema.parse(req.body);
    const document = await supplierService.addDocument(req.params.supplierId, validatedData);
    return res.status(201).json({
      message: 'Supplier document uploaded and cataloged.',
      document,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to add document.' });
  }
}

export async function handleRemoveDocument(req, res) {
  try {
    await supplierService.removeDocument(req.params.id);
    return res.status(200).json({ message: 'Supplier document removed.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to remove document.' });
  }
}
