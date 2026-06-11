import prisma from '../../config/db.js';
import { verifyPreviewToken } from '../websites/engines/preview.engine.js';

const TENANT_INCLUDE = {
  plan: {
    include: {
      planModules: {
        include: {
          module: true,
        },
      },
    },
  },
  modules: {
    include: {
      module: true,
    },
  },
};

function normalizeHost(host = '') {
  return String(host)
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

function getRequestHost(req) {
  return normalizeHost(req.headers['x-forwarded-host'] || req.headers.host || '');
}

function isLocalHost(host) {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(host) || host.endsWith('.localhost');
}

function getSubdomain(host) {
  const rootDomain = normalizeHost(process.env.PUBLIC_ROOT_DOMAIN || 'trimly.in');

  if (host.endsWith('.localhost')) {
    return host.replace(/\.localhost$/, '');
  }

  if (host.endsWith(`.${rootDomain}`)) {
    return host.slice(0, -(rootDomain.length + 1));
  }

  return null;
}

async function findTenantBySlug(slug) {
  if (!slug) return null;
  return prisma.tenant.findUnique({
    where: { slug },
    include: TENANT_INCLUDE,
  });
}

async function findTenantByCustomDomain(host) {
  if (!host) return null;

  const website = await prisma.website.findFirst({
    where: {
      customDomain: host,
      isActive: true,
    },
    include: {
      tenant: {
        include: TENANT_INCLUDE,
      },
    },
  });

  return website?.tenant || null;
}

async function resolvePreview(req) {
  const token = req.query.previewToken || req.headers['x-website-preview-token'];
  if (!token) return null;

  const payload = verifyPreviewToken(token);
  const storedToken = await prisma.websitePreviewToken.findUnique({
    where: { token },
    include: {
      website: {
        include: {
          tenant: {
            include: TENANT_INCLUDE,
          },
        },
      },
    },
  });

  if (!storedToken) {
    throw new Error('Website preview token does not exist.');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Website preview token has expired.');
  }

  if (storedToken.websiteId !== payload.websiteId || storedToken.website.tenantId !== payload.tenantId) {
    throw new Error('Website preview token does not match this website.');
  }

  return {
    mode: 'preview',
    tenant: storedToken.website.tenant,
    websiteId: storedToken.websiteId,
    previewToken: token,
    previewPayload: payload,
  };
}

export async function resolvePublicWebsiteContext(req) {
  const preview = await resolvePreview(req);
  if (preview) {
    return {
      ...preview,
      host: getRequestHost(req),
      pageSlug: req.query.page || req.query.slug || 'home',
    };
  }

  const host = getRequestHost(req);
  const tenantSlug = req.query.tenantSlug || req.headers['x-tenant-slug'];
  let tenant = null;
  let strategy = 'unknown';

  if (tenantSlug) {
    tenant = await findTenantBySlug(tenantSlug);
    strategy = 'explicit-slug';
  }

  if (!tenant && isLocalHost(host)) {
    const localSlug = getSubdomain(host);
    tenant = await findTenantBySlug(localSlug || tenantSlug);
    strategy = localSlug ? 'localhost-subdomain' : 'localhost-explicit';
  }

  if (!tenant) {
    const subdomain = getSubdomain(host);
    if (subdomain && !['www', 'api'].includes(subdomain)) {
      tenant = await findTenantBySlug(subdomain);
      strategy = 'subdomain';
    }
  }

  if (!tenant) {
    tenant = await findTenantByCustomDomain(host);
    strategy = 'custom-domain';
  }

  if (!tenant) {
    throw new Error('Public website tenant could not be resolved from host.');
  }

  return {
    mode: 'published',
    host,
    tenant,
    tenantId: tenant.id,
    pageSlug: req.query.page || req.query.slug || 'home',
    strategy,
  };
}

export default {
  resolvePublicWebsiteContext,
};
