import prisma from '../../config/db.js';

/**
 * Find a specific service by ID, scoped to a tenant.
 * 
 * @param {string} tenantId
 * @param {string} serviceId
 * @returns {Promise<Object|null>}
 */
export async function findServiceById(tenantId, serviceId) {
  return prisma.service.findFirst({
    where: { id: serviceId, tenantId, isActive: true },
  });
}

/**
 * Find staff practitioners eligible for a service.
 * 
 * @param {string} tenantId
 * @param {string} serviceId
 * @param {string} [staffId]
 * @returns {Promise<Array>}
 */
export async function findEligibleStaff(tenantId, serviceId, staffId) {
  const where = {
    tenantId,
    isActive: true,
    services: {
      some: { serviceId },
    },
  };
  if (staffId) {
    where.id = staffId;
  }

  return prisma.staff.findMany({
    where,
    include: {
      schedules: {
        include: {
          breaks: true,
        },
      },
    },
  });
}

/**
 * Fetch salon-wide global holidays for a date.
 * 
 * @param {string} tenantId
 * @param {Date} targetDate
 * @returns {Promise<Array>}
 */
export async function findGlobalHolidays(tenantId, targetDate) {
  return prisma.tenantHoliday.findMany({
    where: {
      tenantId,
      staffId: null,
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
    },
  });
}

/**
 * Fetch staff-specific holidays/leaves.
 * 
 * @param {string} tenantId
 * @param {string} staffId
 * @param {Date} targetDate
 * @returns {Promise<Array>}
 */
export async function findStaffHolidays(tenantId, staffId, targetDate) {
  return prisma.tenantHoliday.findMany({
    where: {
      tenantId,
      staffId,
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
    },
  });
}

/**
 * Fetch all appointments for a staff on a given date.
 * 
 * @param {string} tenantId
 * @param {string} staffId
 * @param {string} dateString - YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function findStaffAppointmentsForDate(tenantId, staffId, dateString) {
  const dayStart = new Date(`${dateString}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateString}T23:59:59.999Z`);
  
  return prisma.appointment.findMany({
    where: {
      tenantId,
      staffId,
      status: { notIn: ['CANCELLED', 'NO_SHOW', 'PAID'] },
      startTime: { gte: dayStart, lte: dayEnd },
    },
  });
}

/**
 * Find bookings by tenant with optional date filters.
 * 
 * @param {string} tenantId
 * @param {Object} [filters]
 * @param {string} [filters.date] - YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function findBookings(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.date) {
    const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
    const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);
    where.startTime = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  if (filters.status) {
    where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
  }

  if (filters.staffId) {
    where.staffId = filters.staffId;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      customer: true,
      staff: true,
      service: true,
      payments: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

/**
 * Find a single booking.
 * 
 * @param {string} tenantId
 * @param {string} bookingId
 * @returns {Promise<Object|null>}
 */
export async function findBookingById(tenantId, bookingId) {
  return prisma.appointment.findFirst({
    where: {
      id: bookingId,
      tenantId,
    },
    include: {
      customer: true,
      staff: true,
      service: true,
      payments: true,
    },
  });
}

/**
 * Check if a staff member has overlapping bookings.
 * Supports passing a custom transactional Client (tx) to perform checks inside transactional blocks.
 * 
 * @param {string} tenantId
 * @param {string} staffId
 * @param {Date} startTime
 * @param {Date} endTime
 * @param {string} [excludeBookingId]
 * @param {Object} [txClient] - Prisma transaction client reference
 * @returns {Promise<boolean>}
 */
export async function checkOverlappingBookings(tenantId, staffId, startTime, endTime, excludeBookingId, txClient) {
  const db = txClient || prisma;
  
  const overlap = await db.appointment.findFirst({
    where: {
      tenantId,
      staffId,
      status: { notIn: ['CANCELLED', 'NO_SHOW', 'PAID'] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
  });

  return !!overlap;
}

/**
 * Locks a specific staff member row for database transaction writes.
 * Crucial to prevent race conditions during booking scheduling under concurrency.
 * 
 * @param {Object} tx - Prisma transaction client reference
 * @param {string} staffId
 * @returns {Promise<void>}
 */
export async function lockStaffRow(tx, staffId) {
  await tx.$executeRawUnsafe(
    `SELECT id FROM "Staff" WHERE id = $1 FOR UPDATE`,
    staffId
  );
}

export async function generateBookingReference(tx, tenantId) {
  const tenant = await tx.tenant.findUnique({
    where: { id: tenantId },
    select: { bookingPrefix: true },
  });

  const prefix = tenant?.bookingPrefix || 'TRM';
  const year = new Date().getFullYear();
  const basePrefix = `${prefix}-${year}-`;
  const count = await tx.appointment.count({
    where: {
      tenantId,
      bookingReference: { startsWith: basePrefix },
    },
  });

  let sequence = count + 1;
  let bookingReference = `${basePrefix}${String(sequence).padStart(6, '0')}`;
  let exists = await tx.appointment.findFirst({
    where: { bookingReference },
    select: { id: true },
  });

  while (exists) {
    sequence += 1;
    bookingReference = `${basePrefix}${String(sequence).padStart(6, '0')}`;
    exists = await tx.appointment.findFirst({
      where: { bookingReference },
      select: { id: true },
    });
  }

  return bookingReference;
}

/**
 * Create a new appointment.
 * Supports transaction client (tx) context.
 * 
 * @param {string} tenantId
 * @param {Object} bookingData
 * @param {Object} [txClient]
 * @returns {Promise<Object>}
 */
export async function createBooking(tenantId, bookingData, txClient) {
  const db = txClient || prisma;
  
  return db.appointment.create({
    data: {
      tenantId,
      customerId: bookingData.customerId,
      staffId: bookingData.staffId,
      serviceId: bookingData.serviceId,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      notes: bookingData.notes,
      status: bookingData.status || 'BOOKED',
      source: bookingData.source || 'ADMIN',
      bookingReference: bookingData.bookingReference,
      serviceItems: bookingData.serviceItems,
      totalAmount: bookingData.totalAmount,
    },
    include: {
      customer: true,
      staff: true,
      service: true,
      payments: true,
    },
  });
}

/**
 * Update an existing appointment.
 * 
 * @param {string} tenantId
 * @param {string} bookingId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export async function updateBooking(tenantId, bookingId, updateData) {
  const existing = await prisma.appointment.findFirst({
    where: { id: bookingId, tenantId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error('Appointment booking not found.');
  }

  return prisma.appointment.update({
    where: {
      id: existing.id,
    },
    data: updateData,
    include: {
      customer: true,
      staff: true,
      service: true,
      payments: true,
    },
  });
}
