import prisma from '../../config/db.js';

export async function generateMonthlyPayroll(tenantId, { month, year }) {
  // Query all active staff
  const staffList = await prisma.staff.findMany({
    where: { tenantId, isActive: true }
  });

  const payrollRecords = [];

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  for (const staff of staffList) {
    // Check if payroll already exists and is locked (APPROVED or PAID)
    const existing = await prisma.payroll.findFirst({
      where: { tenantId, staffId: staff.id, month, year }
    });

    if (existing && existing.status !== 'DRAFT') {
      payrollRecords.push(existing);
      continue;
    }

    // Fetch all completed appointments for this staff in this period
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        staffId: staff.id,
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        service: true,
        payments: {
          where: { paymentStatus: 'PAID' }
        }
      }
    });

    // Calculate commission
    let totalCommission = 0;
    appointments.forEach(app => {
      const hasPaid = app.payments.length > 0;
      if (hasPaid) {
        const price = Number(app.service?.price || 0);
        if (staff.commissionType === 'PERCENTAGE') {
          totalCommission += price * (Number(staff.commissionValue) / 100);
        } else if (staff.commissionType === 'FIXED') {
          totalCommission += Number(staff.commissionValue);
        }
      }
    });

    const baseSalary = Number(staff.baseSalary);
    const finalAmount = baseSalary + totalCommission;

    let record;
    if (existing) {
      // Update existing draft
      record = await prisma.payroll.update({
        where: { id: existing.id },
        data: {
          baseSalary,
          commission: totalCommission,
          finalAmount,
        },
        include: { staff: true }
      });
    } else {
      // Create new draft
      record = await prisma.payroll.create({
        data: {
          tenantId,
          staffId: staff.id,
          month,
          year,
          baseSalary,
          commission: totalCommission,
          bonus: 0.00,
          deductions: 0.00,
          finalAmount,
          status: 'DRAFT'
        },
        include: { staff: true }
      });
    }

    payrollRecords.push(record);
  }

  return payrollRecords;
}

export async function approvePayroll(tenantId, payrollId) {
  const record = await prisma.payroll.findFirst({
    where: { tenantId, id: payrollId }
  });

  if (!record) {
    throw new Error('Payroll record not found.');
  }

  if (record.status !== 'DRAFT') {
    throw new Error('Payroll is already approved or paid.');
  }

  return prisma.payroll.update({
    where: { id: payrollId },
    data: { status: 'APPROVED' },
    include: { staff: true }
  });
}

export async function processPayrollPayout(tenantId, payrollId) {
  const record = await prisma.payroll.findFirst({
    where: { tenantId, id: payrollId },
    include: { staff: true }
  });

  if (!record) {
    throw new Error('Payroll record not found.');
  }

  if (record.status === 'PAID') {
    throw new Error('Payroll is already marked as paid.');
  }

  // Update status to PAID inside transaction and record Salary Expense
  return prisma.$transaction(async (tx) => {
    const updatedPayroll = await tx.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      },
      include: { staff: true }
    });

    // Automatically file Salary Expense
    await tx.expense.create({
      data: {
        tenantId,
        category: 'SALARY',
        amount: record.finalAmount,
        description: `Payroll payout for ${record.staff.name} - ${record.month}/${record.year}`,
        date: new Date()
      }
    });

    return updatedPayroll;
  });
}

export async function listPayrollRecords(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.month) {
    where.month = parseInt(filters.month);
  }
  if (filters.year) {
    where.year = parseInt(filters.year);
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.staffId) {
    where.staffId = filters.staffId;
  }

  return prisma.payroll.findMany({
    where,
    include: { staff: true },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  });
}
