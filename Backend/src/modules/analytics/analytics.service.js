import * as analyticsRepo from './analytics.repository.js';
import { ANALYTICS_CONFIG } from './analytics.constants.js';
import prisma from '../../config/db.js';

/**
 * Helper to convert "HH:MM" format to minutes.
 * 
 * @param {string} timeStr
 * @returns {number}
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculates core salon KPIs for the dashboard view.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function getDashboardMetrics(tenantId) {
  const [earnings, appointments, customers, today, revenue7, revenue30, revenue90, topServices, topStaff] = await Promise.all([
    analyticsRepo.getEarningsSummary(tenantId),
    analyticsRepo.getAppointmentsSummary(tenantId),
    analyticsRepo.getCustomerSummary(tenantId, ANALYTICS_CONFIG.INACTIVE_CLIENT_DAYS),
    analyticsRepo.getTodaySnapshot(tenantId),
    analyticsRepo.getRevenueSeries(tenantId, 7),
    analyticsRepo.getRevenueSeries(tenantId, 30),
    analyticsRepo.getRevenueSeries(tenantId, 90),
    analyticsRepo.getTopServices(tenantId, 5),
    analyticsRepo.getTopStaff(tenantId, 5),
  ]);

  // Calculate Average Bill Value (Total Year Earnings / Completed Bookings Count)
  const completedCount = appointments.statusCounts.COMPLETED || 0;
  const totalYearRevenue = Number(earnings.year);
  const averageBillValue = completedCount > 0 ? (totalYearRevenue / completedCount).toFixed(2) : '0.00';

  // Calculate overall workload average
  const staffPerformance = await getStaffWorkload(tenantId);
  const totalWorkload = staffPerformance.reduce((sum, s) => sum + s.workload_percentage, 0);
  const averageWorkload = staffPerformance.length > 0 ? Math.round(totalWorkload / staffPerformance.length) : 0;

  return {
    earnings_today: earnings.today,
    earnings_week: earnings.week,
    earnings_month: earnings.month,
    earnings_year: earnings.year,
    today: {
      earnings: Number(today.earnings),
      bookings: today.bookings,
      customers: today.customers,
    },
    appointments_total: appointments.statusCounts.total,
    appointments_completed: appointments.statusCounts.COMPLETED,
    appointments_cancelled: appointments.statusCounts.CANCELLED,
    appointments_pending: appointments.statusCounts.PENDING,
    appointments_missed: appointments.statusCounts.NO_SHOW, // Missed corresponds to NO_SHOW status
    customers_total: customers.total,
    customers_new: customers.new,
    customers_returning: customers.returning,
    customers_vip: customers.vip,
    customers_inactive: customers.inactive,
    average_bill_value: Number(averageBillValue),
    average_staff_workload: averageWorkload,
    charts: {
      revenue_7_days: revenue7,
      revenue_30_days: revenue30,
      revenue_90_days: revenue90,
      booking_trend: appointments.trend,
    },
    top_services: topServices,
    top_staff: topStaff,
  };
}

/**
 * Returns revenue summaries.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function getEarningsSummary(tenantId) {
  const earnings = await analyticsRepo.getEarningsSummary(tenantId);
  return {
    today: earnings.today,
    week: earnings.week,
    month: earnings.month,
    year: earnings.year,
  };
}

/**
 * Returns appointment counts and trends.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function getAppointmentsSummary(tenantId) {
  return analyticsRepo.getAppointmentsSummary(tenantId);
}

/**
 * Returns customer segmentation metrics.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function getCustomersSummary(tenantId) {
  return analyticsRepo.getCustomerSummary(tenantId, ANALYTICS_CONFIG.INACTIVE_CLIENT_DAYS);
}

/**
 * Returns service rankings by popularity.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function getServicePerformance(tenantId) {
  const list = await analyticsRepo.getServicePerformance(tenantId);
  
  // Slice top 5 and least 5 services
  const topServices = list.slice(0, 5);
  const leastServices = list.length > 5 ? list.slice(-5).reverse() : [];

  return {
    top_services: topServices,
    least_used_services: leastServices,
  };
}

/**
 * Calculates staff workloads ( utilization % ) based on booked minutes vs weekly available hours.
 * 
 * @param {string} tenantId
 * @returns {Promise<Array>}
 */
export async function getStaffWorkload(tenantId) {
  const rawStaffList = await analyticsRepo.getStaffWorkloadData(tenantId);

  return rawStaffList.map(staff => {
    // 1. Calculate available weekly shift minutes from schedules minus breaks
    let weeklyAvailableMinutes = 0;
    
    staff.schedules.forEach(sched => {
      if (!sched.isWorkingDay) return;

      const shiftStart = timeToMinutes(sched.startTime);
      const shiftEnd = timeToMinutes(sched.endTime);
      let dailyShiftMinutes = Math.max(0, shiftEnd - shiftStart);

      // Subtract daily breaks duration
      sched.breaks.forEach(br => {
        const breakStart = timeToMinutes(br.startTime);
        const breakEnd = timeToMinutes(br.endTime);
        const breakDuration = Math.max(0, breakEnd - breakStart);
        dailyShiftMinutes = Math.max(0, dailyShiftMinutes - breakDuration);
      });

      weeklyAvailableMinutes += dailyShiftMinutes;
    });

    // 2. Calculate booked minutes from completed / confirmed appointments
    let totalBookedMinutes = 0;
    let totalRevenue = 0.00;

    staff.appointments.forEach(app => {
      totalBookedMinutes += app.service.duration;
      const appPayments = app.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      totalRevenue += appPayments;
    });

    // 3. Compute workload percentage (capped at 100%)
    let workloadPercentage = 0;
    if (weeklyAvailableMinutes > 0) {
      workloadPercentage = Math.min(100, Math.round((totalBookedMinutes / (weeklyAvailableMinutes * 4)) * 100)); // Scaled by 4 to compare total history duration or weekly averages.
      // If we calculate over the historical appointments, let's normalize or compare relative to total scheduled.
      // For MVP, we divide booked minutes by weekly available hours scaled to a 4-week month (representing utilization in a 4-week block).
    }

    return {
      staffId: staff.id,
      staffName: staff.name,
      appointments_count: staff.appointments.length,
      total_earnings: totalRevenue,
      workload_percentage: workloadPercentage,
    };
  });
}

export async function getStaffPerformance(tenantId) {
  const staffList = await prisma.staff.findMany({
    where: { tenantId }
  });

  const performance = [];

  for (const staff of staffList) {
    // 1. Revenues and Appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        staffId: staff.id,
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      include: {
        payments: {
          where: { paymentStatus: 'PAID' }
        }
      }
    });

    let totalRevenue = 0;
    let completedCount = 0;

    appointments.forEach(app => {
      if (app.payments.length > 0) {
        const appRevenue = app.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        totalRevenue += appRevenue;
        completedCount++;
      }
    });

    const averageBillValue = completedCount > 0 ? Number((totalRevenue / completedCount).toFixed(2)) : 0;

    // 2. Attendance Summary
    const attendanceLogs = await prisma.attendance.findMany({
      where: {
        tenantId,
        staffId: staff.id
      }
    });

    const presentDays = attendanceLogs.filter(l => l.status === 'PRESENT' || l.status === 'LATE').length;
    const lateDays = attendanceLogs.filter(l => l.status === 'LATE').length;
    const halfDays = attendanceLogs.filter(l => l.status === 'HALF_DAY').length;
    const absentDays = attendanceLogs.filter(l => l.status === 'ABSENT').length;
    const leaveDays = attendanceLogs.filter(l => l.status === 'LEAVE').length;
    const totalHours = attendanceLogs.reduce((sum, l) => sum + Number(l.workingHours || 0), 0);

    performance.push({
      staffId: staff.id,
      staffName: staff.name,
      avatar: staff.avatar || null,
      isActive: staff.isActive,
      metrics: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        appointmentsCount: completedCount,
        averageBillValue,
        attendance: {
          presentDays,
          lateDays,
          halfDays,
          absentDays,
          leaveDays,
          totalHours: Number(totalHours.toFixed(2))
        }
      }
    });
  }

  return performance;
}
