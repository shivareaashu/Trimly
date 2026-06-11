import prisma from '../../config/db.js';

/**
 * Normalizes a date to start of day in UTC.
 * @param {Date|string} date 
 */
function toLocalDateString(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export async function clockIn(tenantId, { staffId, checkIn }) {
  const checkInDate = new Date(checkIn || new Date());
  const dateStr = toLocalDateString(checkInDate);

  // Check if staff exists
  const staff = await prisma.staff.findFirst({
    where: { tenantId, id: staffId }
  });
  if (!staff) {
    throw new Error('Staff member not found.');
  }

  // Check if already checked in for today
  const existing = await prisma.attendance.findFirst({
    where: { tenantId, staffId, date: dateStr }
  });

  if (existing) {
    throw new Error('Staff member is already clocked in for today.');
  }

  // Determine status (e.g. check if late based on standard schedule)
  // Let's assume late if check-in is after 09:30 AM local time
  const hour = checkInDate.getHours();
  const minutes = checkInDate.getMinutes();
  let status = 'PRESENT';
  if (hour > 9 || (hour === 9 && minutes > 30)) {
    status = 'LATE';
  }

  return prisma.attendance.create({
    data: {
      tenantId,
      staffId,
      date: dateStr,
      checkIn: checkInDate,
      status,
      notes: status === 'LATE' ? 'Late check-in recorded.' : null
    },
    include: { staff: true }
  });
}

export async function getStaffProfileForUser(tenantId, user) {
  const staff = await prisma.staff.findFirst({
    where: {
      tenantId,
      isActive: true,
      OR: [
        { userId: user.id },
        ...(user.email ? [{ email: user.email }] : []),
      ],
    },
  });

  if (!staff) {
    throw new Error('No active staff profile is linked to this user.');
  }

  return staff;
}

export async function clockInSelf(tenantId, user, { checkIn } = {}) {
  const staff = await getStaffProfileForUser(tenantId, user);
  return clockIn(tenantId, { staffId: staff.id, checkIn });
}

export async function clockOutSelf(tenantId, user, { checkOut } = {}) {
  const staff = await getStaffProfileForUser(tenantId, user);
  return clockOut(tenantId, { staffId: staff.id, checkOut });
}

export async function getSelfAttendance(tenantId, user, filters = {}) {
  const staff = await getStaffProfileForUser(tenantId, user);
  const attendance = await getAttendanceList(tenantId, { ...filters, staffId: staff.id });
  return { staff, attendance };
}

export async function clockOut(tenantId, { staffId, checkOut }) {
  const checkOutDate = new Date(checkOut || new Date());
  const dateStr = toLocalDateString(checkOutDate);

  // Find today's check-in
  const attendance = await prisma.attendance.findFirst({
    where: { tenantId, staffId, date: dateStr }
  });

  if (!attendance) {
    throw new Error('No clock-in record found for today. Please clock in first.');
  }

  if (attendance.checkOut) {
    throw new Error('Staff member is already clocked out for today.');
  }

  const checkInTime = new Date(attendance.checkIn).getTime();
  const checkOutTime = checkOutDate.getTime();
  const diffMs = checkOutTime - checkInTime;
  const hours = diffMs > 0 ? Number((diffMs / (1000 * 60 * 60)).toFixed(2)) : 0;

  let status = attendance.status;
  if (hours < 4) {
    status = 'HALF_DAY';
  }

  return prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: checkOutDate,
      workingHours: hours,
      status,
      notes: hours < 4 ? 'Auto flagged half-day due to short shift.' : attendance.notes
    },
    include: { staff: true }
  });
}

export async function getAttendanceList(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.staffId) {
    where.staffId = filters.staffId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = toLocalDateString(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = toLocalDateString(filters.endDate);
    }
  }

  return prisma.attendance.findMany({
    where,
    include: { staff: true },
    orderBy: { date: 'desc' }
  });
}

export async function getStaffSummary(tenantId, { staffId, month, year }) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  const logs = await prisma.attendance.findMany({
    where: {
      tenantId,
      staffId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const presentDays = logs.filter(l => l.status === 'PRESENT' || l.status === 'LATE').length;
  const lateDays = logs.filter(l => l.status === 'LATE').length;
  const halfDays = logs.filter(l => l.status === 'HALF_DAY').length;
  const absentDays = logs.filter(l => l.status === 'ABSENT').length;
  const totalHours = logs.reduce((sum, l) => sum + Number(l.workingHours || 0), 0);

  return {
    staffId,
    month,
    year,
    presentDays,
    lateDays,
    halfDays,
    absentDays,
    totalHours: Number(totalHours.toFixed(2)),
    recordsCount: logs.length
  };
}

export async function recordAttendance(tenantId, { staffId, date, status, notes }) {
  const dateStr = toLocalDateString(date || new Date());
  
  // Remove any conflicting records for this day
  await prisma.attendance.deleteMany({
    where: { tenantId, staffId, date: dateStr }
  });

  return prisma.attendance.create({
    data: {
      tenantId,
      staffId,
      date: dateStr,
      status,
      notes: notes || `Recorded as ${status} manually.`,
      checkIn: status === 'PRESENT' ? new Date() : null,
    },
    include: { staff: true }
  });
}
