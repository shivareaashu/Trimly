import publicWebsiteService from './publicWebsite.service.js';

function getDeviceFromUserAgent(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
  return 'Desktop';
}

/**
 * Controller to fetch the published tenant website layout.
 * Scoped automatically by subdomain/domain host header resolution.
 * 
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export async function handleGetPublicWebsite(req, res) {
  try {
    const data = await publicWebsiteService.getWebsiteForContext(req.publicWebsite);

    // Log visit asynchronously if not in preview mode
    if (req.publicWebsite.mode !== 'preview') {
      const tenantId = req.publicWebsite.tenant.id;
      const websiteId = data.website.id;
      const pageSlug = req.publicWebsite.pageSlug;
      const page = data.pages.find(p => p.slug === pageSlug) || data.pages.find(p => p.isHome);

      const visitData = {
        tenantId,
        websiteId,
        pageId: page ? page.id : null,
        sessionId: req.query.sessionId || req.headers['x-session-id'] || 'session-anonymous',
        source: req.query.utm_source || req.query.ref || 'Direct',
        medium: req.query.utm_medium || 'web',
        device: getDeviceFromUserAgent(req.headers['user-agent']),
        country: req.headers['cf-ipcountry'] || 'IN'
      };

      publicWebsiteService.logVisit(visitData).catch(err => console.error('Failed to log website visit:', err));
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ error: error.message || 'Website not found or not published.' });
  }
}

/**
 * Submit form from public website and log a lead.
 */
export async function handleSubmitForm(req, res) {
  try {
    const { formId } = req.params;
    const tenantId = req.tenant.id; // Scoped automatically by resolver middleware

    const clientInfo = {
      source: req.query.utm_source || req.body.source || 'website',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || null
    };

    const submission = await publicWebsiteService.submitForm(tenantId, formId, req.body, clientInfo);

    return res.status(201).json({
      message: 'Form submission received successfully.',
      submission
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Form submission failed.' });
  }
}

export default {
  handleGetPublicWebsite,
  handleSubmitForm
};
