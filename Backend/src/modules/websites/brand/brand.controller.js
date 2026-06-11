import * as brandService from './brand.service.js';

export async function getBrand(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await brandService.getBrand(tenantId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve brand settings.' });
  }
}

export async function updateBrand(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await brandService.updateBrand(tenantId, req.body);
    return res.status(200).json({
      message: 'Brand settings updated successfully.',
      brand: data
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update brand settings.' });
  }
}
