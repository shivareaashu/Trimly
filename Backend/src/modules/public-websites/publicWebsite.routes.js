import { Router } from 'express';
import { handleGetPublicWebsite, handleSubmitForm } from './publicWebsite.controller.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { resolvePublicWebsite } from './publicTenant.middleware.js';

const router = Router();

// Unauthenticated public routes: host/custom-domain/subdomain/preview-token tenant resolution.
router.get('/', resolvePublicWebsite, requireModule('website'), handleGetPublicWebsite);
router.post('/forms/:formId/submit', resolvePublicWebsite, requireModule('website'), handleSubmitForm);

export default router;
