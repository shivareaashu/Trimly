import prisma from '../../config/db.js';

/**
 * Find a specific active service by ID.
 */
export async function findServiceById(tenantId, serviceId) {
  return prisma.service.findFirst({
    where: { id: serviceId, tenantId, isActive: true },
  });
}

/**
 * Find staff practitioners eligible for a service.
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
 */
export async function findStaffAppointmentsForDate(tenantId, staffId, dateString) {
  const dayStart = new Date(`${dateString}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateString}T23:59:59.999Z`);
  
  return prisma.appointment.findMany({
    where: {
      tenantId,
      staffId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      startTime: { gte: dayStart, lte: dayEnd },
    },
  });
}

/**
 * Find customer by email or normalized phone under the tenant.
 */
export async function findCustomerByEmailOrPhone(tenantId, { email, normalizedPhone }, txClient) {
  const db = txClient || prisma;
  const or = [];
  
  if (normalizedPhone) {
    or.push({ normalizedPhone });
  }
  if (email) {
    or.push({ email });
  }
  
  if (or.length === 0) return null;

  return db.customer.findFirst({
    where: {
      tenantId,
      OR: or,
    },
  });
}

/**
 * Create a new customer profile.
 */
export async function createCustomer(tenantId, data, txClient) {
  const db = txClient || prisma;
  return db.customer.create({
    data: {
      tenantId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      normalizedPhone: data.normalizedPhone || null,
      notes: 'Registered via public website booking portal.',
    },
  });
}

/**
 * Locks the selected staff row to serialize concurrent booking operations.
 */
export async function lockStaffRow(tx, staffId) {
  await tx.$executeRawUnsafe(
    `SELECT id FROM "Staff" WHERE id = $1 FOR UPDATE`,
    staffId
  );
}

/**
 * Check if staff has overlapping appointments.
 */
export async function checkOverlappingBookings(tenantId, staffId, startTime, endTime, txClient) {
  const db = txClient || prisma;
  
  const overlap = await db.appointment.findFirst({
    where: {
      tenantId,
      staffId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
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
 * Generate a unique booking reference in format: {PREFIX}-{YEAR}-{SEQUENCE}
 */
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
      bookingReference: {
        startsWith: basePrefix,
      },
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
 * Create a new appointment booking.
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
      notes: bookingData.notes || null,
      source: 'WEBSITE',
      bookingReference: bookingData.bookingReference,
      status: 'PENDING',
    },
    include: {
      customer: true,
      staff: true,
      service: true,
    },
  });
}
