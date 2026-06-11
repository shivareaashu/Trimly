/**
 * Middleware to verify that the authenticated user is a Super Admin.
 * Should be mounted after authenticate.
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ error: 'Access denied. Super Admin privileges required.' });
  }
  next();
}
