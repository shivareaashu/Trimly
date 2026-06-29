import * as customerRepo from './customer.repository.js';
import { emitCustomerEvent } from './customer.events.js';
import { CUSTOMER_TAGS, VIP_SPENDING_THRESHOLD } from './customer.constants.js';
import prisma from '../../config/db.js';

export function getCustomerLifecycleStatus(lastVisitAt, now = new Date()) {
  if (!lastVisitAt) return 'ACTIVE';
  const daysSinceVisit = Math.floor((now - new Date(lastVisitAt)) / 86400000);
  if (daysSinceVisit <= 30) return 'ACTIVE';
  if (daysSinceVisit <= 60) return 'DUE_SOON';
  if (daysSinceVisit <= 90) return 'AT_RISK';
  return 'INACTIVE';
}

export function getCustomerRevisitSummary(customer, now = new Date()) {
  const lastVisitAt = customer.lastVisitAt ? new Date(customer.lastVisitAt) : null;
  const expectedRevisitDays = customer.expectedRevisitDays || 30;
  const daysSinceLastVisit = lastVisitAt ? Math.floor((now - lastVisitAt) / 86400000) : null;
  const expectedRevisitAt = lastVisitAt
    ? new Date(lastVisitAt.getTime() + expectedRevisitDays * 86400000)
    : null;

  return {
    lastVisitAt,
    daysSinceLastVisit,
    expectedRevisitDays,
    expectedRevisitAt,
    lifecycleStatus: getCustomerLifecycleStatus(lastVisitAt, now),
  };
}

/**
 * Normalizes phone numbers to a consistent string.
 * 
 * @param {string} phone
 * @returns {string}
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, ''); // strip non-digits
}

/**
 * Creates a new customer profile.
 * Ensures the phone/email is unique for this tenant.
 * 
 * @param {string} tenantId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createCustomer(tenantId, data) {
  const normalizedPhone = normalizePhone(data.phone);

  // Check email uniqueness within tenant scope
  if (data.email) {
    const list = await customerRepo.findCustomers(tenantId, { search: data.email });
    const match = list.find(c => c.email?.toLowerCase() === data.email.toLowerCase());
    if (match) {
      throw new Error(`A customer with email '${data.email}' already exists.`);
    }
  }

  // Check phone uniqueness within tenant scope
  if (normalizedPhone) {
    const list = await customerRepo.findCustomers(tenantId, { search: normalizedPhone });
    const match = list.find(c => normalizePhone(c.phone) === normalizedPhone);
    if (match) {
      throw new Error(`A customer with phone number '${data.phone}' already exists.`);
    }
  }

  // Ensure 'new' tag is default for new profiles
  const tags = [...(data.tags || [])];
  if (!tags.includes(CUSTOMER_TAGS.NEW)) {
    tags.push(CUSTOMER_TAGS.NEW);
  }

  const customer = await customerRepo.createCustomer(tenantId, {
    ...data,
    phone: normalizedPhone || null,
    tags,
  });

  await emitCustomerEvent('customer.created', customer);
  return customer;
}

/**
 * Updates a customer profile.
 * 
 * @param {string} tenantId
 * @param {string} customerId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateCustomer(tenantId, customerId, data) {
  const current = await customerRepo.findCustomerById(tenantId, customerId);
  if (!current) {
    throw new Error('Customer not found.');
  }

  const updateData = { ...data };

  if (data.phone) {
    updateData.phone = normalizePhone(data.phone);
  }

  const customer = await customerRepo.updateCustomer(tenantId, customerId, updateData);
  await emitCustomerEvent('customer.updated', customer);
  return customer;
}

/**
 * Pulls database summaries to update cached spending metrics and tags.
 * 
 * @param {string} tenantId
 * @param {string} customerId
 * @returns {Promise<Object>} Updated customer record
 */
export async function recalculateCustomerMetrics(tenantId, customerId) {
  const customer = await customerRepo.findCustomerById(tenantId, customerId);
  if (!customer) {
    throw new Error('Customer profile not found.');
  }

  // Fetch aggregates from database
  const metrics = await customerRepo.calculateCustomerMetricsFromDb(tenantId, customerId);

  // Check if VIP threshold has been crossed
  const tags = [...customer.tags];
  const isVip = metrics.totalSpending >= VIP_SPENDING_THRESHOLD;
  const hasVipTag = tags.includes(CUSTOMER_TAGS.VIP);

  if (isVip && !hasVipTag) {
    tags.push(CUSTOMER_TAGS.VIP);
  } else if (!isVip && hasVipTag) {
    const idx = tags.indexOf(CUSTOMER_TAGS.VIP);
    tags.splice(idx, 1);
  }

  // Remove the 'new' tag if they have completed visits (lastVisitAt is set)
  if (metrics.lastVisitAt && tags.includes(CUSTOMER_TAGS.NEW)) {
    const idx = tags.indexOf(CUSTOMER_TAGS.NEW);
    tags.splice(idx, 1);
  }

  const updatedCustomer = await customerRepo.updateCustomer(tenantId, customerId, {
    totalSpending: metrics.totalSpending,
    lastVisitAt: metrics.lastVisitAt,
    expectedRevisitDays: metrics.expectedRevisitDays,
    lifecycleStatus: getCustomerLifecycleStatus(metrics.lastVisitAt),
    tags,
  });

  await emitCustomerEvent('customer.metrics_updated', updatedCustomer);
  return updatedCustomer;
}

export async function getCustomersDueForRevisit(tenantId, filters = {}) {
  return customerRepo.findCustomersDueForRevisit(tenantId, filters);
}

export async function refreshLifecycleForTenant(tenantId) {
  const customers = await customerRepo.findCustomers(tenantId);
  const updates = customers.map((customer) => {
    const nextStatus = getCustomerLifecycleStatus(customer.lastVisitAt);
    if (nextStatus === customer.lifecycleStatus) return null;
    return prisma.customer.update({
      where: { id: customer.id },
      data: { lifecycleStatus: nextStatus },
    });
  }).filter(Boolean);

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  return { checked: customers.length, updated: updates.length };
}

export async function getCustomerTimeline(tenantId, customerId) {
  let events = await prisma.customerTimelineEvent.findMany({
    where: { tenantId, customerId },
    orderBy: { occurredAt: 'desc' }
  });

  if (events.length === 0) {
    // Self-healing fallback: Generate timeline events from appointments & payments
    const appointments = await prisma.appointment.findMany({
      where: { tenantId, customerId },
      include: { service: true, staff: true, payments: true }
    });

    for (const app of appointments) {
      // 1. Booking created event
      await prisma.customerTimelineEvent.create({
        data: {
          tenantId,
          customerId,
          appointmentId: app.id,
          eventType: 'booking.created',
          title: 'Appointment Booked',
          description: `Booked ${app.service?.name || 'Service'} with ${app.staff?.name || 'Stylist'}`,
          occurredAt: app.createdAt
        }
      });

      // 2. Appointment completed event
      if (app.status === 'COMPLETED') {
        await prisma.customerTimelineEvent.create({
          data: {
            tenantId,
            customerId,
            appointmentId: app.id,
            eventType: 'appointment.completed',
            title: 'Appointment Completed',
            description: `Completed session for ${app.service?.name || 'Service'}`,
            occurredAt: app.endTime
          }
        });
      }

      // 3. Payments made event
      for (const p of app.payments) {
        if (p.paymentStatus === 'PAID') {
          await prisma.customerTimelineEvent.create({
            data: {
              tenantId,
              customerId,
              appointmentId: app.id,
              paymentId: p.id,
              eventType: 'payment.made',
              title: 'Payment Received',
              description: `Paid Rs. ${p.amount} via ${p.paymentMethod}`,
              amount: p.amount,
              occurredAt: p.paidAt || p.createdAt
            }
          });
        }
      }
    }

    // Refetch the newly created events
    events = await prisma.customerTimelineEvent.findMany({
      where: { tenantId, customerId },
      orderBy: { occurredAt: 'desc' }
    });
  }

  return events;
}

export async function getLoyaltyAccount(tenantId, customerId) {
  let account = await prisma.loyaltyAccount.findFirst({
    where: { tenantId, customerId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: {
        tenantId,
        customerId,
        pointsBalance: 0,
        lifetimePoints: 0,
        redeemedPoints: 0
      },
      include: {
        transactions: true
      }
    });
  }

  return account;
}

export async function adjustLoyaltyPoints(tenantId, customerId, { points, type, description }) {
  const account = await getLoyaltyAccount(tenantId, customerId);

  const pts = parseInt(points);
  let newBalance = account.pointsBalance;
  let newLifetime = account.lifetimePoints;
  let newRedeemed = account.redeemedPoints;

  if (type === 'EARNED') {
    newBalance += pts;
    newLifetime += pts;
  } else if (type === 'REDEEMED') {
    newBalance = Math.max(0, newBalance - pts);
    newRedeemed += pts;
  } else {
    // ADJUSTED
    newBalance = Math.max(0, newBalance + pts);
    if (pts > 0) {
      newLifetime += pts;
    }
  }

  return prisma.$transaction(async (tx) => {
    const updatedAccount = await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: newBalance,
        lifetimePoints: newLifetime,
        redeemedPoints: newRedeemed
      }
    });

    const transaction = await tx.loyaltyTransaction.create({
      data: {
        tenantId,
        loyaltyAccountId: account.id,
        customerId,
        transactionType: type,
        points: pts,
        description: description || `Points adjustment: ${type}`
      }
    });

    await tx.customerTimelineEvent.create({
      data: {
        tenantId,
        customerId,
        eventType: type === 'REDEEMED' ? 'loyalty.redeemed' : 'loyalty.earned',
        title: `Loyalty Points ${type === 'EARNED' ? 'Earned' : type === 'REDEEMED' ? 'Redeemed' : 'Adjusted'}`,
        description: `${pts} points. Reason: ${description || 'Manual adjustment'}`,
        metadata: { transactionId: transaction.id }
      }
    });

    return { account: updatedAccount, transaction };
  });
}

export async function getMembershipPlans(tenantId) {
  let plans = await prisma.membershipPlan.findMany({
    where: { tenantId, isActive: true },
    include: { benefits: true },
    orderBy: { sortOrder: 'asc' }
  });

  if (plans.length === 0) {
    // Seed default membership plans
    const defaultPlans = [
      { name: 'Silver Plan', code: 'silver', price: 2500, description: 'Basic tier with discounts and standard points', benefits: ['10% off all haircuts', 'Priority appointment confirmation'] },
      { name: 'Gold Plan', code: 'gold', price: 5000, description: 'Most popular tier with substantial benefits', benefits: ['15% off all services', '500 bonus loyalty points', 'Priority scheduling'] },
      { name: 'Platinum Plan', code: 'platinum', price: 10000, description: 'Elite tier for ultimate luxury treatments', benefits: ['20% off all services', 'Complimentary wash & style', 'Unlimited booking priority'] }
    ];

    for (let i = 0; i < defaultPlans.length; i++) {
      const p = defaultPlans[i];
      const createdPlan = await prisma.membershipPlan.create({
        data: {
          tenantId,
          name: p.name,
          code: p.code,
          price: p.price,
          description: p.description,
          isActive: true,
          sortOrder: i
        }
      });

      for (let j = 0; j < p.benefits.length; j++) {
        await prisma.membershipBenefit.create({
          data: {
            membershipPlanId: createdPlan.id,
            title: p.benefits[j],
            benefitType: 'DISCOUNT',
            sortOrder: j
          }
        });
      }
    }

    plans = await prisma.membershipPlan.findMany({
      where: { tenantId, isActive: true },
      include: { benefits: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  return plans;
}

export async function purchaseMembership(tenantId, customerId, { planId, startsAt, endsAt, notes }) {
  const plan = await prisma.membershipPlan.findFirst({
    where: { tenantId, id: planId }
  });

  if (!plan) {
    throw new Error('Membership plan not found.');
  }

  // Deactivate any active memberships first to ensure single active plan
  await prisma.customerMembership.updateMany({
    where: { tenantId, customerId, status: 'ACTIVE' },
    data: { status: 'EXPIRED' }
  });

  const starts = startsAt ? new Date(startsAt) : new Date();
  const ends = endsAt ? new Date(endsAt) : new Date(new Date().setMonth(new Date().getMonth() + 1)); // Default 1 month

  return prisma.$transaction(async (tx) => {
    const membership = await tx.customerMembership.create({
      data: {
        tenantId,
        customerId,
        membershipPlanId: planId,
        status: 'ACTIVE',
        startsAt: starts,
        endsAt: ends,
        notes: notes || `Purchased ${plan.name}`
      },
      include: {
        membershipPlan: true
      }
    });

    await tx.customerTimelineEvent.create({
      data: {
        tenantId,
        customerId,
        membershipId: membership.id,
        eventType: 'membership.purchased',
        title: 'Membership Purchased',
        description: `Subscribed to ${plan.name} (Valid till ${ends.toLocaleDateString()})`,
        amount: plan.price,
        occurredAt: new Date()
      }
    });

    return membership;
  });
}

export async function getCustomerPassport(tenantId, customerId) {
  const customer = await customerRepo.findCustomerWithVisitHistory(tenantId, customerId);
  if (!customer) {
    throw new Error('Customer not found.');
  }

  const [loyaltyAccount, memberships, timelineEvents, mediaAssets] = await Promise.all([
    prisma.loyaltyAccount.findUnique({
      where: { tenantId_customerId: { tenantId, customerId } }
    }).catch(() => null),
    prisma.customerMembership.findMany({
      where: { tenantId, customerId },
      include: { membershipPlan: true },
      orderBy: { startsAt: 'desc' }
    }),
    prisma.customerTimelineEvent.findMany({
      where: { tenantId, customerId },
      orderBy: { occurredAt: 'desc' },
      take: 20
    }),
    prisma.mediaAsset.findMany({
      where: {
        tenantId,
        tags: { has: customerId }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => [])
  ]);

  const completedVisits = customer.appointments.filter(a => a.status === 'COMPLETED' || a.status === 'PAID');
  const visitsCount = completedVisits.length;

  const staffCounts = {};
  completedVisits.forEach(v => {
    if (v.staff?.name) {
      staffCounts[v.staff.name] = (staffCounts[v.staff.name] || 0) + 1;
    }
  });
  let preferredStylist = 'None';
  let maxStaffCount = 0;
  Object.entries(staffCounts).forEach(([name, count]) => {
    if (count > maxStaffCount) {
      maxStaffCount = count;
      preferredStylist = name;
    }
  });

  const serviceCounts = {};
  completedVisits.forEach(v => {
    if (v.service?.name) {
      serviceCounts[v.service.name] = (serviceCounts[v.service.name] || 0) + 1;
    }
  });
  const preferredServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0])
    .slice(0, 3);

  let revisitScore = 30;
  if (visitsCount >= 2) {
    const sortedDates = completedVisits.map(v => new Date(v.startTime).getTime()).sort((a, b) => a - b);
    let totalDiff = 0;
    for (let i = 1; i < sortedDates.length; i++) {
      totalDiff += (sortedDates[i] - sortedDates[i - 1]);
    }
    revisitScore = Math.round(totalDiff / (sortedDates.length - 1) / 86400000);
  }

  const lastVisit = customer.lastVisitAt ? new Date(customer.lastVisitAt) : null;
  const expectedDays = customer.expectedRevisitDays || 30;
  let riskLevel = 'LOW';
  let daysSinceLastVisit = null;
  if (lastVisit) {
    daysSinceLastVisit = Math.floor((Date.now() - lastVisit.getTime()) / 86400000);
    if (daysSinceLastVisit > expectedDays * 2) {
      riskLevel = 'HIGH';
    } else if (daysSinceLastVisit > expectedDays * 1.5) {
      riskLevel = 'MEDIUM';
    }
  }

  const activeMembership = memberships.find(m => m.status === 'ACTIVE');

  return {
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      tags: customer.tags,
      lifecycleStatus: customer.lifecycleStatus,
      createdAt: customer.createdAt,
    },
    metrics: {
      totalSpending: Number(customer.totalSpending),
      visitsCount,
      preferredStylist,
      preferredServices,
      revisitScore,
      riskLevel,
      daysSinceLastVisit,
      lastVisitAt: customer.lastVisitAt
    },
    loyalty: loyaltyAccount ? {
      pointsBalance: loyaltyAccount.pointsBalance,
      lifetimePoints: loyaltyAccount.lifetimePoints,
      redeemedPoints: loyaltyAccount.redeemedPoints
    } : { pointsBalance: 0, lifetimePoints: 0, redeemedPoints: 0 },
    activeMembership: activeMembership ? {
      planName: activeMembership.membershipPlan?.name,
      planCode: activeMembership.membershipPlan?.code,
      endsAt: activeMembership.endsAt,
      notes: activeMembership.notes
    } : null,
    timeline: timelineEvents,
    photos: mediaAssets.map(asset => ({
      id: asset.id,
      url: asset.url,
      fileName: asset.fileName,
      alt: asset.alt,
      createdAt: asset.createdAt
    }))
  };
}
