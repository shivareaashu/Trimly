import { Router } from 'express';
import {
  handleClockIn,
  handleClockOut,
  handleSelfProfile,
  handleSelfClockIn,
  handleSelfClockOut,
  handleSelfAttendance,
  handleListAttendance,
  handleStaffSummary,
  handleRecordAttendance,
  handleGetStaffAttendance,
} from './attendance.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { requireModule } from '../../middleware/subscription.middleware.js';
import { requirePermission } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate, resolveTenant, requireModule('staff'));

router.get('/self/profile', requirePermission('staff.view'), handleSelfProfile);
router.get('/self', requirePermission('staff.view'), handleSelfAttendance);
router.post('/self/clock-in', requirePermission('staff.view'), handleSelfClockIn);
router.post('/self/clock-out', requirePermission('staff.view'), handleSelfClockOut);

router.post('/clock-in', requirePermission('staff.manage'), handleClockIn);
router.post('/clock-out', requirePermission('staff.manage'), handleClockOut);
router.post('/check-in', requirePermission('staff.manage'), handleClockIn);
router.post('/check-out', requirePermission('staff.manage'), handleClockOut);
router.post('/record', requirePermission('staff.manage'), handleRecordAttendance);

router.get('/', requirePermission('staff.view'), handleListAttendance);
router.get('/summary/:staffId', requirePermission('staff.view'), handleStaffSummary);
router.get('/:staffId', requirePermission('staff.view'), handleGetStaffAttendance);

export default router;
