import prisma from '../../config/db.js';

export async function createMediaAsset(tenantId, assetData) {
  return prisma.mediaAsset.create({
    data: {
      tenantId,
      type: assetData.type || 'image',
      folder: assetData.folderName || null,
      folderId: assetData.folderId || null,
      tags: assetData.tags || [],
      fileName: assetData.fileName,
      mimeType: assetData.mimeType,
      url: assetData.url,
      size: assetData.size || null,
      alt: assetData.alt || null,
      uploadedBy: assetData.uploadedBy || null
    }
  });
}

export async function findMediaAssets(tenantId, folderId = null) {
  return prisma.mediaAsset.findMany({
    where: {
      tenantId,
      folderId: folderId || undefined
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function findAssetById(tenantId, id) {
  return prisma.mediaAsset.findFirst({
    where: { id, tenantId }
  });
}

export async function deleteMediaAsset(tenantId, id) {
  return prisma.mediaAsset.deleteMany({
    where: { id, tenantId }
  });
}

export async function createMediaFolder(tenantId, folderData) {
  return prisma.mediaFolder.create({
    data: {
      tenantId,
      name: folderData.name,
      parentId: folderData.parentId || null
    }
  });
}

export async function findFolders(tenantId, parentId = null) {
  return prisma.mediaFolder.findMany({
    where: {
      tenantId,
      parentId: parentId || undefined
    },
    orderBy: { name: 'asc' }
  });
}

export async function searchAssets(tenantId, query) {
  return prisma.mediaAsset.findMany({
    where: {
      tenantId,
      OR: [
        {
          fileName: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            has: query
          }
        }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}
