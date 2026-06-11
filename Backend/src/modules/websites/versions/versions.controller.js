import * as versionsService from './versions.service.js';

export async function getVersions(req, res) {
  try {
    const tenantId = req.tenant.id;
    const versions = await versionsService.getVersions(tenantId);
    return res.status(200).json(versions);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list versions.' });
  }
}

export async function getVersionDetails(req, res) {
  try {
    const tenantId = req.tenant.id;
    const version = await versionsService.getVersionDetails(tenantId, req.params.id);
    return res.status(200).json(version);
  } catch (error) {
    return res.status(404).json({ error: error.message || 'Version not found.' });
  }
}

export async function restoreVersion(req, res) {
  try {
    const tenantId = req.tenant.id;
    const website = await versionsService.restoreVersion(tenantId, req.params.id);
    return res.status(200).json({
      message: 'Website restored to selected version snapshot successfully.',
      website
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to restore version.' });
  }
}
