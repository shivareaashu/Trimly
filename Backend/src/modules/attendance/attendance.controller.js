import * as attendanceService from './attendance.service.js';

export async function handleClockIn(req, res) {
  try {
    const { staffId, checkIn } = req.body;
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required.' });
    }

    const log = await attendanceService.clockIn(req.tenant.id, { staffId, checkIn });
    return res.status(201).json({
      message: 'Clock-in recorded successfully.',
      attendance: log
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to clock in.' });
  }
}

export async function handleClockOut(req, res) {
  try {
    const { staffId, checkOut } = req.body;
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required.' });
    }

    const log = await attendanceService.clockOut(req.tenant.id, { staffId, checkOut });
    return res.status(200).json({
      message: 'Clock-out recorded successfully.',
      attendance: log
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to clock out.' });
  }
}

export async function handleSelfProfile(req, res) {
  try {
    const staff = await attendanceService.getStaffProfileForUser(req.tenant.id, req.user);
    return res.status(200).json({ staff });
  } catch (error) {
    return res.status(404).json({ error: error.message || 'Failed to resolve staff profile.' });
  }
}

export async function handleSelfClockIn(req, res) {
  try {
    const { checkIn } = req.body;
    const log = await attendanceService.clockInSelf(req.tenant.id, req.user, { checkIn });
    return res.status(201).json({
      message: 'Your clock-in was recorded successfully.',
      attendance: log,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to clock in.' });
  }
}

export async function handleSelfClockOut(req, res) {
  try {
    const { checkOut } = req.body;
    const log = await attendanceService.clockOutSelf(req.tenant.id, req.user, { checkOut });
    return res.status(200).json({
      message: 'Your clock-out was recorded successfully.',
      attendance: log,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to clock out.' });
  }
}

export async function handleSelfAttendance(req, res) {
  try {
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const result = await attendanceService.getSelfAttendance(req.tenant.id, req.user, filters);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to fetch your attendance.' });
  }
}

export async function handleListAttendance(req, res) {
  try {
    const filters = {
      staffId: req.query.staffId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const logs = await attendanceService.getAttendanceList(req.tenant.id, filters);
    return res.status(200).json({ attendance: logs });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to list attendance records.' });
  }
}

export async function handleStaffSummary(req, res) {
  try {
    const staffId = req.params.staffId;
    const month = parseInt(req.query.month || new Date().getMonth() + 1);
    const year = parseInt(req.query.year || new Date().getFullYear());

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required.' });
    }

    const summary = await attendanceService.getStaffSummary(req.tenant.id, { staffId, month, year });
    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to generate staff attendance summary.' });
  }
}

export async function handleRecordAttendance(req, res) {
  try {
    const { staffId, date, status, notes } = req.body;
    if (!staffId || !status) {
      return res.status(400).json({ error: 'Staff ID and status are required.' });
    }

    const log = await attendanceService.recordAttendance(req.tenant.id, { staffId, date, status, notes });
    return res.status(201).json({
      message: 'Attendance record registered successfully.',
      attendance: log
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to record attendance.' });
  }
}

export async function handleGetStaffAttendance(req, res) {
  try {
    const { staffId } = req.params;
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required.' });
    }

    const logs = await attendanceService.getAttendanceList(req.tenant.id, { staffId });
    return res.status(200).json({ attendance: logs });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to fetch staff attendance logs.' });
  }
}
