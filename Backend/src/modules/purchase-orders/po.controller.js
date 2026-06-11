import * as poService from './po.service.js';
import { createPOSchema, updatePOSchema } from './po.validation.js';
import { z } from 'zod';

export async function handleListPOs(req, res) {
  try {
    const filters = {
      branchId: req.query.branchId,
      supplierId: req.query.supplierId,
      status: req.query.status,
    };
    const pos = await poService.getPOs(req.tenant.id, filters);
    return res.status(200).json({ pos });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list purchase orders.' });
  }
}

export async function handleGetPO(req, res) {
  try {
    const po = await poService.getPO(req.tenant.id, req.params.id);
    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found.' });
    }
    return res.status(200).json({ po });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve purchase order.' });
  }
}

export async function handleCreatePO(req, res) {
  try {
    const validatedData = createPOSchema.parse(req.body);
    const po = await poService.createPO(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Purchase order created successfully in draft state.',
      po,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create purchase order.' });
  }
}

export async function handleUpdatePO(req, res) {
  try {
    const validatedData = updatePOSchema.parse(req.body);
    const po = await poService.updatePO(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Purchase order details updated successfully.',
      po,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update purchase order.' });
  }
}

export async function handleDeletePO(req, res) {
  try {
    await poService.deletePO(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Purchase order deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete purchase order.' });
  }
}

export async function handleApprovePO(req, res) {
  try {
    const po = await poService.approvePO(req.tenant.id, req.params.id);
    return res.status(200).json({
      message: 'Purchase order has been approved.',
      po,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to approve purchase order.' });
  }
}

export async function handleSendPO(req, res) {
  try {
    const po = await poService.sendPO(req.tenant.id, req.params.id);
    return res.status(200).json({
      message: 'Purchase order has been marked as sent to supplier.',
      po,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to send purchase order.' });
  }
}
