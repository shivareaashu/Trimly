import { Router } from 'express';
import {
  handleCreateOrder,
  handleGetPayment,
  handleListPayments,
  handleRefundPayment,
  handleUpdatePaymentStatus,
  handleVerifyPayment,
  handleWebhook,
  handleCreateCashfreeSession,
  handleCashfreeWebhook,
  handleGetCashfreeStatus,
} from './payments.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

// Public payment flow for the booking portal
router.post('/create-order', resolveTenant, requireModule('payments'), handleCreateOrder);
router.post('/verify', resolveTenant, requireModule('payments'), handleVerifyPayment);
router.post('/webhook/razorpay', resolveTenant, requireModule('payments'), handleWebhook);

// Cashfree endpoints
router.post('/cashfree/session', resolveTenant, requireModule('payments'), handleCreateCashfreeSession);
router.post('/cashfree/webhook', resolveTenant, requireModule('payments'), handleCashfreeWebhook);
router.get('/cashfree/status/:orderId', resolveTenant, requireModule('payments'), handleGetCashfreeStatus);


// Authenticated payment management
router.use(authenticate, resolveTenant, requireModule('payments'));

router.get('/', requirePermission('payment.view'), handleListPayments);
router.get('/:id', requirePermission('payment.view'), handleGetPayment);
router.put('/:id', requirePermission('payment.manage'), handleUpdatePaymentStatus);
router.post('/refund', requirePermission('payment.manage'), handleRefundPayment);

export default router;
