import { Router } from 'express';
import * as publicBookingController from './publicBooking.controller.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { publicRateLimit } from '../../middleware/publicRateLimit.middleware.js';

const router = Router();

// Apply tenant resolution and check subscription for all public booking routes
router.use(resolveTenant);
router.use(requireModule('bookings'));

// Public catalog lookups
router.get('/config', publicBookingController.getConfig);
router.get('/services', publicBookingController.getServices);
router.get('/staff', publicBookingController.getStaff);
router.get('/slots', publicBookingController.getSlots);
router.get('/branches', publicBookingController.getBranches);

// Returning customer fast-path (rate-limited to prevent enumeration)
router.get('/customer-lookup', publicRateLimit, publicBookingController.lookupCustomer);

// Temporary slot hold placement (rate-limited to avoid bot starvation)
router.post('/hold', publicRateLimit, publicBookingController.holdSlot);

// Final booking creation (heavily rate-limited)
router.post('/', publicRateLimit, publicBookingController.createBooking);

// Lead capture and analytics (lightweight, fire-and-forget)
router.post('/lead', publicBookingController.captureLead);
router.post('/analytics', publicBookingController.trackAnalytics);

export default router;

