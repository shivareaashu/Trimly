import { t, tMessage } from './localization.service.js';

/**
 * Express middleware to resolve and bind the tenant's language locale to the request.
 * Attaches req.t and req.tMessage translation helpers.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export function resolveLocale(req, res, next) {
  // Read resolved tenant language (attached via resolveTenant middleware), default to 'en'
  const locale = req.tenant?.language || 'en';
  
  req.locale = locale;
  
  // Attach translation helpers dynamically
  req.t = (key, variables) => t(key, locale, variables);
  req.tMessage = (key, variables) => tMessage(key, locale, variables);
  
  next();
}

export default resolveLocale;
