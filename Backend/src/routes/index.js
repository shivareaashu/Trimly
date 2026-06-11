import { Router } from 'express';
import authRoutes from '../core/auth/auth.routes.js';
import bookingRoutes from '../modules/bookings/booking.routes.js';
import customerRoutes from '../modules/customers/customer.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import uploadRoutes from '../core/uploads/upload.routes.js';
import mediaRoutes from '../modules/media/media.routes.js';
import websiteRoutes from '../modules/websites/website.routes.js';
import publicWebsiteRoutes from '../modules/public-websites/publicWebsite.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import publicBookingRoutes from '../modules/public-bookings/publicBooking.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import payrollRoutes from '../modules/payroll/payroll.routes.js';
import expenseRoutes from '../modules/expenses/expense.routes.js';
import financeRoutes from '../modules/finance/finance.routes.js';
import staffRoutes from '../modules/staff/staff.routes.js';
import superAdminRoutes from '../modules/superadmin/superadmin.routes.js';
import serviceRoutes from '../modules/services/service.routes.js';
import inventoryRoutes from '../modules/inventory/inventory.routes.js';
import supplierRoutes from '../modules/suppliers/supplier.routes.js';
import poRoutes from '../modules/purchase-orders/po.routes.js';
import grRoutes from '../modules/goods-receiving/gr.routes.js';
import movementRoutes from '../modules/stock-movements/movement.routes.js';


const apiRouter = Router();

// Core system routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/media', mediaRoutes);

// Feature module routes
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/websites', websiteRoutes);
apiRouter.use('/public/website', publicWebsiteRoutes);
apiRouter.use('/public/bookings', publicBookingRoutes);
apiRouter.use('/payments', paymentsRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/payroll', payrollRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/superadmin', superAdminRoutes);
apiRouter.use('/super-admin', superAdminRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/suppliers', supplierRoutes);
apiRouter.use('/purchase-orders', poRoutes);
apiRouter.use('/goods-receiving', grRoutes);
apiRouter.use('/stock-movements', movementRoutes);



// Placeholder modules registry mapping
apiRouter.get('/modules', (req, res) => {
  res.json({
    availableModules: [
      { code: 'dashboard', name: 'Dashboard' },
      { code: 'activities', name: 'Activity Center' },
      { code: 'branches', name: 'Branches' },
      { code: 'bookings', name: 'Bookings' },
      { code: 'customers', name: 'CRM' },
      { code: 'staff', name: 'Staff Management' },
      { code: 'services', name: 'Services' },
      { code: 'payments', name: 'Payments' },
      { code: 'payroll', name: 'Payroll' },
      { code: 'expenses', name: 'Expenses' },
      { code: 'finance', name: 'Finance' },
      { code: 'inventory', name: 'Inventory' },
      { code: 'suppliers', name: 'Suppliers' },
      { code: 'purchaseOrders', name: 'Purchase Orders' },
      { code: 'goodsReceiving', name: 'Goods Receiving' },
      { code: 'stockMovements', name: 'Stock Movements' },
      { code: 'analytics', name: 'Analytics' },
      { code: 'reports', name: 'Reports' },
      { code: 'websites', name: 'Website Builder' },
      { code: 'publicWebsites', name: 'Public Websites' },
      { code: 'publicBookings', name: 'Public Bookings' },
      { code: 'notifications', name: 'Notifications' },
      { code: 'search', name: 'Global Search' },
      { code: 'localization', name: 'Localization' },
      { code: 'whatsapp', name: 'WhatsApp Automations' },
      { code: 'loyalty', name: 'Loyalty Program' },
    ]
  });
});

export default apiRouter;
