import jwt from 'jsonwebtoken';
import prisma from '../../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-trimly-saas';
const DEFAULT_PREVIEW_TTL_SECONDS = 60 * 30;

export async function createPreviewToken({ websiteId, tenantId, userId, ttlSeconds = DEFAULT_PREVIEW_TTL_SECONDS }) {
  const token = jwt.sign(
    {
      type: 'website_preview',
      websiteId,
      tenantId,
      userId,
    },
    JWT_SECRET,
    { expiresIn: ttlSeconds }
  );

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await prisma.websitePreviewToken.create({
    data: {
      websiteId,
      token,
      expiresAt,
      createdBy: userId,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export function verifyPreviewToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.type !== 'website_preview') {
    throw new Error('Invalid website preview token.');
  }
  return payload;
}
