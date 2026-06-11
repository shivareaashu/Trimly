import * as mediaService from './media.service.js';

export async function uploadMedia(req, res) {
  try {
    const tenantId = req.tenant.id;
    const file = req.file;
    const { folderId, alt, tags } = req.body;
    const uploadedBy = req.user?.id || 'system';

    const asset = await mediaService.uploadAndCreateAsset(tenantId, file, {
      folderId,
      alt,
      tags,
      uploadedBy
    });

    return res.status(201).json({
      message: 'Media file uploaded and registered successfully.',
      asset
    });
  } catch (error) {
    console.error('Media Upload Error:', error);
    return res.status(400).json({ error: error.message || 'Media upload failed.' });
  }
}

export async function listMedia(req, res) {
  try {
    const tenantId = req.tenant.id;
    const folderId = req.query.folderId || null;
    const data = await mediaService.getMedia(tenantId, folderId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list media assets.' });
  }
}

export async function deleteMedia(req, res) {
  try {
    const tenantId = req.tenant.id;
    await mediaService.removeAsset(tenantId, req.params.id);
    return res.status(200).json({
      message: 'Media asset deleted successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete media asset.' });
  }
}

export async function createFolder(req, res) {
  try {
    const tenantId = req.tenant.id;
    const folder = await mediaService.createFolder(tenantId, req.body);
    return res.status(201).json({
      message: 'Media folder created successfully.',
      folder
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create media folder.' });
  }
}

export async function searchMedia(req, res) {
  try {
    const tenantId = req.tenant.id;
    const query = req.query.q || '';
    const assets = await mediaService.searchMedia(tenantId, query);
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Media search failed.' });
  }
}
