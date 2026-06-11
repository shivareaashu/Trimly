import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

// Submodule Controllers
import { getDashboard } from './dashboard/dashboard.controller.js';
import { listTemplates, getTemplate, selectTemplate } from './templates/templates.controller.js';
import { getBrand, updateBrand } from './brand/brand.controller.js';
import { listPages, createPage, updatePage, deletePage, reorderPages } from './pages/pages.controller.js';
import { getSections, createSection, updateSection, deleteSection, reorderSections } from './sections/sections.controller.js';
import { getThemes, selectTheme } from './themes/themes.controller.js';
import { getForms, createForm, updateForm, deleteForm } from './forms/forms.controller.js';
import { getLeads, getLeadDetails, updateStatus } from './leads/leads.controller.js';
import { getSeo, updateSeo } from './seo/seo.controller.js';
import { createPreviewToken } from './preview/preview.controller.js';
import { publishWebsite } from './publish/publish.controller.js';
import { getVersions, getVersionDetails, restoreVersion } from './versions/versions.controller.js';
import {
  getOverallAnalytics,
  getPagesAnalytics,
  getSourcesAnalytics,
  getConversionsAnalytics
} from './analytics/analytics.controller.js';

const router = Router();

// Apply auth, tenant scoping, and module checks to all website endpoints
router.use(authenticate, resolveTenant, requireModule('website'));

// 1. Dashboard
router.get('/dashboard', requirePermission('website.view'), getDashboard);

// 2. Templates
router.get('/templates', requirePermission('website.view'), listTemplates);
router.get('/templates/:id', requirePermission('website.view'), getTemplate);
router.post('/templates/:id/select', requirePermission('website.update'), selectTemplate);

// 3. Brand Setup
router.get('/brand', requirePermission('website.view'), getBrand);
router.put('/brand', requirePermission('website.update'), updateBrand);

// 4. Pages Manager
router.get('/pages', requirePermission('website.view'), listPages);
router.post('/pages', requirePermission('website.update'), createPage);
router.put('/pages/:id', requirePermission('website.update'), updatePage);
router.delete('/pages/:id', requirePermission('website.update'), deletePage);
router.post('/pages/reorder', requirePermission('website.update'), reorderPages);

// 5. Section Builder
router.get('/pages/:pageId/sections', requirePermission('website.view'), getSections);
router.post('/sections', requirePermission('website.update'), createSection);
router.put('/sections/:id', requirePermission('website.update'), updateSection);
router.delete('/sections/:id', requirePermission('website.update'), deleteSection);
router.post('/sections/reorder', requirePermission('website.update'), reorderSections);

// 6. Theme Engine
router.get('/themes', requirePermission('website.view'), getThemes);
router.put('/theme', requirePermission('website.update'), selectTheme);

// 7. Forms Engine
router.get('/forms', requirePermission('website.view'), getForms);
router.post('/forms', requirePermission('website.update'), createForm);
router.put('/forms/:id', requirePermission('website.update'), updateForm);
router.delete('/forms/:id', requirePermission('website.update'), deleteForm);

// 8. Leads Engine
router.get('/leads', requirePermission('website.view'), getLeads);
router.get('/leads/:id', requirePermission('website.view'), getLeadDetails);
router.put('/leads/:id/status', requirePermission('website.update'), updateStatus);

// 9. SEO Studio
router.get('/pages/:id/seo', requirePermission('website.view'), getSeo);
router.put('/pages/:id/seo', requirePermission('website.update'), updateSeo);

// 10. Preview Token
router.post('/preview-token', requirePermission('website.update'), createPreviewToken);

// 11. Publish Website
router.post('/publish', requirePermission('website.publish'), publishWebsite);

// 12. Versions
router.get('/versions', requirePermission('website.view'), getVersions);
router.get('/versions/:id', requirePermission('website.view'), getVersionDetails);
router.post('/versions/:id/restore', requirePermission('website.update'), restoreVersion);

// 13. Analytics
router.get('/analytics', requirePermission('website.view'), getOverallAnalytics);
router.get('/analytics/pages', requirePermission('website.view'), getPagesAnalytics);
router.get('/analytics/sources', requirePermission('website.view'), getSourcesAnalytics);
router.get('/analytics/conversions', requirePermission('website.view'), getConversionsAnalytics);

export default router;
