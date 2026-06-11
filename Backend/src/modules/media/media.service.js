import * as mediaRepo from './media.repository.js';
import { uploadFile } from '../../shared/services/storage/storage.service.js';

export async function uploadAndCreateAsset(tenantId, file, { folderId, alt, tags, uploadedBy }) {
  if (!file) {
    throw new Error('No file provided.');
  }

  // Upload file physically using Trimly's storage service
  const url = await uploadFile(file);

  let processedTags = [];
  if (tags) {
    processedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  const assetData = {
    fileName: file.originalname,
    mimeType: file.mimetype,
    type: file.mimetype.split('/')[0] || 'image',
    url,
    size: file.size,
    alt,
    tags: processedTags,
    folderId: folderId || null,
    uploadedBy
  };

  return mediaRepo.createMediaAsset(tenantId, assetData);
}

export async function getMedia(tenantId, folderId) {
  const [assets, folders] = await Promise.all([
    mediaRepo.findMediaAssets(tenantId, folderId),
    mediaRepo.findFolders(tenantId, folderId)
  ]);

  return {
    assets,
    folders
  };
}

export async function removeAsset(tenantId, id) {
  const asset = await mediaRepo.findAssetById(tenantId, id);
  if (!asset) {
    throw new Error('Asset not found.');
  }

  // Delete from DB
  await mediaRepo.deleteMediaAsset(tenantId, id);

  // In production, we would also trigger storage service physical deletion
  return true;
}

export async function createFolder(tenantId, folderData) {
  if (!folderData.name) {
    throw new Error('Folder name is required.');
  }
  return mediaRepo.createMediaFolder(tenantId, folderData);
}

export async function searchMedia(tenantId, query) {
  if (!query) {
    return mediaRepo.findMediaAssets(tenantId);
  }
  return mediaRepo.searchAssets(tenantId, query);
}
