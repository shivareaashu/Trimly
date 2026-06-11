import * as bookingService from './booking.service.js';
import * as bookingRepo from './booking.repository.js';
import { getSlotsSchema, createBookingSchema, updateBookingSchema, bookingActionSchema, addServiceSchema } from './booking.validation.js';
import { z } from 'zod';
import prisma from '../../config/db.js';


/**
 * Endpoint to fetch available slots on a given date.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetSlots(req, res) {
  try {
    const query = getSlotsSchema.parse(req.query);
    const slots = await bookingService.getAvailableSlots(req.tenant.id, query);
    return res.status(200).json({ slots });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to fetch slots.' });
  }
}

/**
 * Endpoint to list all bookings for the tenant.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleListBookings(req, res) {
  try {
    const filters = {
      date: req.query.date, // e.g. ?date=2026-06-03
      status: req.query.status ? String(req.query.status).split(',') : undefined,
      staffId: req.query.staffId,
    };
    const bookings = await bookingRepo.findBookings(req.tenant.id, filters);
    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list bookings.' });
  }
}

export async function handleBookingAction(req, res) {
  try {
    const validatedData = bookingActionSchema.parse(req.body);
    const booking = await bookingService.transitionBooking(req.tenant.id, req.params.id, validatedData.action, validatedData);
    return res.status(200).json({ message: 'Appointment updated.', booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update appointment.' });
  }
}

export async function handleAddBookingService(req, res) {
  try {
    const validatedData = addServiceSchema.parse(req.body);
    const booking = await bookingService.addServiceToBooking(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({ message: 'Service added to appointment.', booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to add service.' });
  }
}

export async function handleFollowUpSuggestion(req, res) {
  try {
    const booking = await bookingRepo.findBookingById(req.tenant.id, req.params.id);
    if (!booking) return res.status(404).json({ error: 'Appointment booking not found.' });
    return res.status(200).json({ suggestion: bookingService.getFollowUpSuggestion(booking) });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to build follow-up suggestion.' });
  }
}

export async function handleReceptionDashboard(req, res) {
  try {
    const today = req.query.date || new Date().toISOString().slice(0, 10);
    const todaysAppointments = await bookingRepo.findBookings(req.tenant.id, { date: today });
    const completedWaitingForBilling = await bookingRepo.findBookings(req.tenant.id, { status: ['COMPLETED'] });
    const pendingPayments = await prisma.payment.findMany({
      where: {
        tenantId: req.tenant.id,
        paymentStatus: { in: ['PENDING', 'PARTIALLY_PAID'] },
      },
      include: { customer: true, appointment: { include: { service: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.status(200).json({
      today,
      todaysAppointments,
      walkIns: todaysAppointments.filter((item) => item.source === 'RECEPTION'),
      checkIns: todaysAppointments.filter((item) => ['CHECKED_IN', 'ASSIGNED', 'CONSULTATION', 'IN_SERVICE'].includes(item.status)),
      pendingPayments,
      upcomingAppointments: todaysAppointments.filter((item) => new Date(item.startTime) >= new Date()),
      billingQueue: completedWaitingForBilling,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to load receptionist dashboard.' });
  }
}

/**
 * Endpoint to view a single booking.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetBooking(req, res) {
  try {
    const booking = await bookingRepo.findBookingById(req.tenant.id, req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Appointment booking not found.' });
    }
    return res.status(200).json({ booking });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch booking.' });
  }
}

/**
 * Endpoint to create/place a new booking.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleCreateBooking(req, res) {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const booking = await bookingService.createBooking(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Appointment booked successfully.',
      booking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create booking.' });
  }
}

/**
 * Endpoint to update/modify a booking.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleUpdateBooking(req, res) {
  try {
    const validatedData = updateBookingSchema.parse(req.body);
    const booking = await bookingService.updateBooking(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Appointment updated successfully.',
      booking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update booking.' });
  }
}

/**
 * Endpoint to cancel a booking.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleCancelBooking(req, res) {
  try {
    const booking = await bookingService.cancelBooking(req.tenant.id, req.params.id);
    return res.status(200).json({
      message: 'Appointment cancelled successfully.',
      booking,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to cancel booking.' });
  }
}

export async function handleListStaff(req, res) {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        tenantId: req.tenant.id,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return res.status(200).json({ staff });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch staff.' });
  }
}

export default {
  handleGetSlots,
  handleListBookings,
  handleGetBooking,
  handleCreateBooking,
  handleUpdateBooking,
  handleCancelBooking,
  handleBookingAction,
  handleAddBookingService,
  handleFollowUpSuggestion,
  handleReceptionDashboard,
  handleListStaff,
};
