import prisma from '../config/db.js';

/**
 * Express middleware to resolve branch context based on x-branch-id header.
 * Requires resolveTenant middleware to run beforehand.
 * Attaches branch details to req.branch.
 */
export async function resolveBranch(req, res, next) {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(500).json({ error: 'Tenant context is missing. Ensure resolveTenant runs first.' });
    }

    const branchId = req.headers['x-branch-id'];

    // If branch ID is not provided, proceed without scoping (admin may view all branches or single branch default)
    if (!branchId) {
      req.branchId = null;
      req.branch = null;
      return next();
    }

    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        tenantId: tenant.id,
      },
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found or does not belong to this tenant.' });
    }

    req.branchId = branch.id;
    req.branch = branch;
    next();
  } catch (error) {
    console.error('Branch Resolution Error:', error);
    return res.status(500).json({ error: 'Branch resolution error.' });
  }
}
