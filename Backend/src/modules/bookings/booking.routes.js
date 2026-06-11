import { Router } from 'express';
import {
  handleGetSlots,
  handleListBookings,
  handleGetBooking,
  handleCreateBooking,
  handleUpdateBooking,
  handleCancelBooking,
  handleBookingAction,
  handleAddBookingService,
  handleFollowUpSuggestion,
  handleReceptionDashboard,
  handleListStaff
} from './booking.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';


const router = Router();

// Publicly accessible endpoints (e.g. for the salon's generated client booking page)
router.get('/slots', resolveTenant, requireModule('bookings'), handleGetSlots);
router.post('/public-book', resolveTenant, requireModule('bookings'), handleCreateBooking);

// Protected dashboard endpoints
router.get(
  '/',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.view'),
  handleListBookings
);

router.get(
  '/reception/dashboard',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.view'),
  handleReceptionDashboard
);

router.get(
  '/staff',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  handleListStaff
);


router.get(
  '/:id',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.view'),
  handleGetBooking
);

router.post(
  '/',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.create'),
  handleCreateBooking
);

router.put(
  '/:id',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.update'),
  handleUpdateBooking
);

router.post(
  '/:id/action',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.update'),
  handleBookingAction
);

router.post(
  '/:id/add-service',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.update'),
  handleAddBookingService
);

router.get(
  '/:id/follow-up',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.view'),
  handleFollowUpSuggestion
);

router.delete(
  '/:id',
  authenticate,
  resolveTenant,
  requireModule('bookings'),
  requirePermission('booking.delete'),
  handleCancelBooking
);

export default router;
