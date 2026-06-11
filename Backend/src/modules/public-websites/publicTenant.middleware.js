import { resolvePublicWebsiteContext } from './tenantResolver.service.js';

export async function resolvePublicWebsite(req, res, next) {
  try {
    const context = await resolvePublicWebsiteContext(req);
    req.publicWebsite = context;
    req.tenant = context.tenant;
    next();
  } catch (error) {
    return res.status(404).json({
      error: error.message || 'Unable to resolve public website.',
    });
  }
}
