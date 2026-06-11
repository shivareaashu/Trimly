import * as movementService from './movement.service.js';

export async function handleListMovements(req, res) {
  try {
    const filters = {
      branchId: req.query.branchId,
      itemId: req.query.itemId,
      type: req.query.type,
    };
    const movements = await movementService.getMovements(req.tenant.id, filters);
    return res.status(200).json({ movements });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list stock movements.' });
  }
}

export async function handleGetMovement(req, res) {
  try {
    const movement = await movementService.getMovement(req.tenant.id, req.params.id);
    if (!movement) {
      return res.status(404).json({ error: 'Stock movement not found.' });
    }
    return res.status(200).json({ movement });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve stock movement.' });
  }
}
