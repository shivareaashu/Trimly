import publicWebsiteRepo from './publicWebsite.repository.js';
import redisClient from '../../config/redis.js';
import prisma from '../../config/db.js';
import { compileWebsitePayload } from '../websites/engines/publish.engine.js';

const CACHE_EXPIRATION = 86400;

export async function getPublishedWebsite(tenantId) {
  const cacheKey = `website:${tenantId}`;

  try {
    if (redisClient && redisClient.isOpen) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Redis Cache HIT for key: '${cacheKey}'`);
        return JSON.parse(cachedData);
      }
    }
  } catch (error) {
    console.warn('Redis read error:', error.message);
  }

  console.log(`Redis Cache MISS for key: '${cacheKey}'. Querying PostgreSQL...`);
  const website = await publicWebsiteRepo.findPublishedWebsite(tenantId);

  if (!website) {
    throw new Error('Website not found or not published.');
  }

  const websitePayload = await compileWebsitePayload({
    tenantId,
    website,
    mode: 'published'
  });

  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.set(cacheKey, JSON.stringify(websitePayload), {
        EX: CACHE_EXPIRATION
      });
      console.log(`Website cached in Redis under: '${cacheKey}'`);
    }
  } catch (error) {
    console.warn('Redis write error:', error.message);
  }

  return websitePayload;
}

export async function getWebsiteForContext(context) {
  if (context.mode === 'preview') {
    const website = await publicWebsiteRepo.findPreviewWebsite({
      tenantId: context.tenant.id,
      websiteId: context.websiteId
    });

    if (!website) {
      throw new Error('Website preview not found.');
    }

    return compileWebsitePayload({
      tenantId: context.tenant.id,
      website,
      mode: 'draft'
    });
  }

  return getPublishedWebsite(context.tenant.id);
}

export async function logVisit(visitData) {
  try {
    await prisma.websiteVisit.create({
      data: {
        tenantId: visitData.tenantId,
        websiteId: visitData.websiteId,
        pageId: visitData.pageId,
        sessionId: visitData.sessionId,
        source: visitData.source || 'Direct',
        medium: visitData.medium || 'web',
        device: visitData.device || 'Desktop',
        country: visitData.country || 'IN'
      }
    });
    console.log(`👁️ Logged website visit for website: ${visitData.websiteId}, page: ${visitData.pageId || 'Home'}`);
  } catch (err) {
    console.error('Failed to log website visit:', err.message);
  }
}

export async function submitForm(tenantId, formId, submissionData, clientInfo) {
  const form = await prisma.websiteForm.findFirst({
    where: { id: formId, website: { tenantId }, isActive: true },
    include: { fields: true }
  });

  if (!form) {
    throw new Error('Form not found or is inactive.');
  }

  // 1. Validate fields
  const payload = {};
  for (const field of form.fields) {
    const value = submissionData[field.fieldKey];
    if (field.required && (value === undefined || value === null || value === '')) {
      throw new Error(`Field '${field.label}' is required.`);
    }
    payload[field.fieldKey] = value !== undefined ? value : '';
  }

  // Identify contact info (name, email, phone) from submission keys
  const name = payload.name || payload.fullName || payload.Name || '';
  const email = payload.email || payload.Email || '';
  const phone = payload.phone || payload.mobile || payload.Phone || payload.whatsapp || '';

  return prisma.$transaction(async (tx) => {
    // 2. Create lead if phone or email is captured
    let leadId = null;
    if (phone || email) {
      const lead = await tx.websiteLead.create({
        data: {
          tenantId,
          websiteId: form.websiteId,
          name: name ? String(name) : 'Anonymous Form Submission',
          phone: phone ? String(phone) : null,
          email: email ? String(email) : null,
          source: clientInfo.source || 'Form Submission',
          status: 'NEW',
          payload
        }
      });
      leadId = lead.id;
    }

    // 3. Create Form Submission
    return tx.websiteFormSubmission.create({
      data: {
        formId,
        pageId: submissionData.pageId || null,
        leadId,
        data: payload,
        source: clientInfo.source || 'website',
        ipAddress: clientInfo.ipAddress || null,
        userAgent: clientInfo.userAgent || null
      }
    });
  });
}

export default {
  getPublishedWebsite,
  getWebsiteForContext,
  logVisit,
  submitForm
};
