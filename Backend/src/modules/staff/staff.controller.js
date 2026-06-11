import * as staffService from './staff.service.js';

export async function handleListStaff(req, res) {
  try {
    const isActiveQuery = req.query.isActive;
    const filters = {};
    if (isActiveQuery !== undefined) {
      filters.isActive = isActiveQuery === 'true';
    }

    const staff = await staffService.listStaff(req.tenant.id, filters);
    return res.status(200).json({ staff });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list staff.' });
  }
}

export async function handleGetStaff(req, res) {
  try {
    const staff = await staffService.getStaffById(req.tenant.id, req.params.id);
    return res.status(200).json({ staff });
  } catch (error) {
    return res.status(404).json({ error: error.message || 'Staff member not found.' });
  }
}

export async function handleCreateStaff(req, res) {
  try {
    const staff = await staffService.createStaff(req.tenant.id, req.body);
    return res.status(201).json({
      message: 'Staff member created successfully.',
      staff,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create staff.' });
  }
}

export async function handleUpdateStaff(req, res) {
  try {
    const staff = await staffService.updateStaff(req.tenant.id, req.params.id, req.body);
    return res.status(200).json({
      message: 'Staff member updated successfully.',
      staff,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update staff.' });
  }
}

export async function handleDeleteStaff(req, res) {
  try {
    const staff = await staffService.deleteStaff(req.tenant.id, req.params.id);
    return res.status(200).json({
      message: 'Staff member deactivated successfully.',
      staff,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to deactivate staff.' });
  }
}
