import * as grService from './gr.service.js';
import { createReceiptSchema } from './gr.validation.js';
import { z } from 'zod';

export async function handleListReceipts(req, res) {
  try {
    const filters = {
      branchId: req.query.branchId,
      poId: req.query.poId,
    };
    const receipts = await grService.getReceipts(req.tenant.id, filters);
    return res.status(200).json({ receipts });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list goods receipts.' });
  }
}

export async function handleGetReceipt(req, res) {
  try {
    const receipt = await grService.getReceipt(req.tenant.id, req.params.id);
    if (!receipt) {
      return res.status(404).json({ error: 'Goods receipt not found.' });
    }
    return res.status(200).json({ receipt });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve goods receipt.' });
  }
}

export async function handleReceiveGoods(req, res) {
  try {
    const validatedData = createReceiptSchema.parse(req.body);
    const receipt = await grService.receiveGoods(req.tenant.id, req.user.id, validatedData);
    return res.status(201).json({
      message: 'Goods received successfully. Stock levels and expenses updated.',
      receipt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to process goods receiving.' });
  }
}
