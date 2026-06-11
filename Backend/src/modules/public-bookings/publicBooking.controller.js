import * as publicBookingService from './publicBooking.service.js';
import { getSlotsSchema, holdSlotSchema, createPublicBookingSchema } from './publicBooking.validation.js';
import prisma from '../../config/db.js';
import { createActivityEvent } from '../../shared/services/activity/activity.service.js';

/**
 * Fetch all active services for the tenant.
 */
export async function getServices(req, res) {
  try {
    const tenantId = req.tenant.id;
    const services = await prisma.service.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
      },
    });

    return res.json(services);
  } catch (error) {
    console.error('Error fetching public services:', error);
    return res.status(500).json({ error: 'Failed to retrieve services.' });
  }
}

/**
 * Fetch eligible staff members for a specific service.
 */
export async function getStaff(req, res) {
  try {
    const tenantId = req.tenant.id;
    const { serviceId } = req.query;

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required.' });
    }

    const staffList = await prisma.staff.findMany({
      where: {
        tenantId,
        isActive: true,
        services: {
          some: {
            serviceId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        bio: true,
      },
    });

    return res.json(staffList);
  } catch (error) {
    console.error('Error fetching public staff:', error);
    return res.status(500).json({ error: 'Failed to retrieve staff.' });
  }
}

/**
 * Get available time slots for a service, staff, and date.
 */
export async function getSlots(req, res) {
  try {
    const tenantId = req.tenant.id;
    
    // Parse query params
    const parsed = getSlotsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const slots = await publicBookingService.getAvailableSlots(tenantId, parsed.data);
    return res.json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to retrieve available slots.' });
  }
}

/**
 * Place a temporary lock/hold on an available slot.
 */
export async function holdSlot(req, res) {
  try {
    const tenantId = req.tenant.id;

    // Validate body
    const parsed = holdSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const holdData = await publicBookingService.holdSlot(tenantId, parsed.data);
    return res.json(holdData);
  } catch (error) {
    console.error('Error holding slot:', error.message);
    const errorMsg = req.t ? req.t(error.message) : error.message;
    return res.status(400).json({ error: errorMsg || 'Failed to place slot hold.' });
  }
}

/**
 * Confirm and create a public guest booking.
 */
export async function createBooking(req, res) {
  try {
    const tenantId = req.tenant.id;

    // Validate request
    const parsed = createPublicBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const booking = await publicBookingService.createPublicBooking(tenantId, parsed.data);
    return res.status(201).json({
      message: 'Booking created successfully!',
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        serviceName: booking.service.name,
        staffName: booking.staff.name,
      },
    });
  } catch (error) {
    console.error('Error creating public booking:', error.message);
    let errorMsg = error.message;
    if (req.t) {
      if (error.message === 'public_booking.notice_limit') {
        errorMsg = req.t('public_booking.notice_limit', { hours: 2 });
      } else {
        errorMsg = req.t(error.message);
      }
    }
    return res.status(400).json({ error: errorMsg || 'Failed to create booking.' });
  }
}

/**
 * Get tenant configuration and active modules list.
 * Enriched with branches (for branch step) and themeCode (for dynamic theming).
 */
export async function getConfig(req, res) {
  try {
    const tenant = req.tenant;
    
    // Aggregate overrides list
    const activeOverrides = (tenant.modules || [])
      .filter((m) => m.isActive)
      .map((m) => m.module);
      
    // Plan default features
    const planFeatures = tenant.plan?.features || [];
    
    // Combine features and overrides
    const activeModules = Array.from(new Set([...planFeatures, ...activeOverrides]));

    // Fetch branches for multi-branch support
    const branches = await prisma.branch.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, phone: true, address: true },
    });

    // Fetch website theme code for dynamic theming
    const website = await prisma.website.findUnique({
      where: { tenantId: tenant.id },
      select: { themeCode: true, templateCode: true },
    });

    return res.json({
      name: tenant.name,
      slug: tenant.slug,
      language: tenant.language,
      bookingPrefix: tenant.bookingPrefix,
      activeModules,
      branches,
      themeCode: website?.themeCode || 'luxury',
      templateCode: website?.templateCode || 'luxury',
    });
  } catch (error) {
    console.error('Error fetching tenant booking config:', error);
    return res.status(500).json({ error: 'Failed to retrieve booking configuration.' });
  }
}

/**
 * Fetch active branches for the tenant.
 */
export async function getBranches(req, res) {
  try {
    const tenantId = req.tenant.id;
    const branches = await prisma.branch.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        phone: true,
        address: true,
      },
    });
    return res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return res.status(500).json({ error: 'Failed to retrieve branches.' });
  }
}

/**
 * Lookup an existing customer by phone number (returning customer fast-path).
 * Returns minimal info: firstName, lastName, email.
 * Rate-limited to prevent enumeration.
 */
export async function lookupCustomer(req, res) {
  try {
    const tenantId = req.tenant.id;
    const phone = req.query.phone;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length < 5) {
      return res.status(400).json({ error: 'Phone number is too short.' });
    }

    const customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        normalizedPhone,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    return res.json(customer);
  } catch (error) {
    console.error('Error looking up customer:', error);
    return res.status(500).json({ error: 'Lookup failed.' });
  }
}

/**
 * Capture an abandoned booking as a lead.
 * Uses sendBeacon from frontend — body is raw text.
 */
export async function captureLead(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Only capture if there's useful data
    if (!data.phone && !data.email) {
      return res.status(204).end();
    }

    // Use ActivityEvent as lead record (WebsiteLead model will be added in Website Builder sprint)
    await createActivityEvent(tenantId, {
      eventType: 'booking.abandoned',
      title: `Booking abandoned at step: ${data.abandonedAtStep || 'unknown'}`,
      description: `${data.name || 'Unknown'} - ${data.phone || data.email || 'no contact'}`,
      sourceModule: 'public-booking',
      entityType: 'lead',
      metadata: {
        phone: data.phone,
        email: data.email,
        name: data.name,
        service: data.service,
        abandonedAtStep: data.abandonedAtStep,
        source: 'BOOKING',
      },
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error capturing booking lead:', error);
    return res.status(204).end(); // Never fail the beacon
  }
}

/**
 * Track a booking analytics event.
 * Uses sendBeacon from frontend — lightweight, fire-and-forget.
 */
export async function trackAnalytics(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    await createActivityEvent(tenantId, {
      eventType: `booking.analytics.${data.event || 'unknown'}`,
      title: data.event || 'unknown',
      sourceModule: 'booking-analytics',
      metadata: {
        ...data,
        tenantId: undefined, // don't duplicate
      },
    });

    return res.status(204).end();
  } catch (error) {
    // Analytics should never fail the user experience
    return res.status(204).end();
  }
}
