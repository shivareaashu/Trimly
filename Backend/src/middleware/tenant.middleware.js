import prisma from '../config/db.js';

/**
 * Express middleware to resolve tenant based on x-tenant-id or custom header/query.
 * Attaches tenant object to req.tenant.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function resolveTenant(req, res, next) {
  try {
    const tenantId = req.headers['x-tenant-id'];
    const tenantSlug = req.headers['x-tenant-slug'];

    if (!tenantId && !tenantSlug) {
      return res.status(400).json({ error: 'Tenant identifier missing. Provide x-tenant-id or x-tenant-slug header.' });
    }

    let tenant = null;

    if (tenantId) {
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
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
        },
      });
    } else if (tenantSlug) {
      tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        include: {
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
        },
      });
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    if (tenant.subscriptionStatus === 'CANCELED') {
      return res.status(402).json({ error: 'Subscription is inactive. Please contact support.' });
    }

    // Attach resolved tenant to the request
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant Resolution Error:', error);
    return res.status(500).json({ error: 'Tenant resolution error.' });
  }
}
