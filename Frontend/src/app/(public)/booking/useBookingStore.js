'use client';

import { create } from 'zustand';
import { buildFlow } from './bookingStepRegistry';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const useBookingStore = create((set, get) => ({
  // ─── Navigation ────────────────────────────────────────────
  stepIndex: 0,
  flow: ['welcome', 'service', 'stylist', 'date', 'time', 'details', 'review', 'success'],
  tenantSlug: '',
  tenantConfig: null,

  // ─── Data ──────────────────────────────────────────────────
  services: [],
  branches: [],
  staffList: [],
  availableSlots: [],
  selectedService: null,
  selectedBranchId: null,
  selectedStaff: null,        // null = "Any Available"
  selectedDate: null,         // Date object
  selectedSlot: null,         // { staffId, staffName, startTime, endTime }
  customer: { firstName: '', lastName: '', phone: '', email: '', notes: '' },
  isReturningCustomer: false,

  // ─── Result ────────────────────────────────────────────────
  bookingResult: null,
  holdToken: null,

  // ─── UI ────────────────────────────────────────────────────
  isLoading: false,
  error: null,

  // ─── Computed ──────────────────────────────────────────────
  /** Current step key (e.g. 'service', 'stylist') */
  get currentStepKey() {
    return get().flow[get().stepIndex] || 'welcome';
  },

  // ─── Navigation Actions ────────────────────────────────────
  setTenantSlug: (slug) => set({ tenantSlug: slug }),

  nextStep: () => {
    const { stepIndex, flow } = get();
    const nextIdx = Math.min(stepIndex + 1, flow.length - 1);
    set({ stepIndex: nextIdx, error: null });
  },

  prevStep: () => {
    const { stepIndex } = get();
    set({ stepIndex: Math.max(stepIndex - 1, 0), error: null });
  },

  goToStep: (index) => set({ stepIndex: index, error: null }),

  goToStepByKey: (key) => {
    const idx = get().flow.indexOf(key);
    if (idx !== -1) set({ stepIndex: idx, error: null });
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ─── Analytics ─────────────────────────────────────────────
  trackEvent: (eventName, data = {}) => {
    const { tenantSlug } = get();
    try {
      const payload = JSON.stringify({
        event: eventName,
        slug: tenantSlug,
        ...data,
        ts: Date.now(),
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE}/api/public/bookings/analytics`, payload);
      }
    } catch {
      // Analytics is fire-and-forget
    }
  },

  // ─── Fetch tenant config ───────────────────────────────────
  fetchConfig: async () => {
    const slug = get().tenantSlug;
    if (!slug) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/public/bookings/config`, {
        headers: { 'x-tenant-slug': slug },
      });
      if (!res.ok) throw new Error('Invalid salon. Check the link and try again.');
      const data = await res.json();

      // Build dynamic flow from tenant config
      const flow = buildFlow(data);

      set({ tenantConfig: data, flow, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ─── Fetch services ────────────────────────────────────────
  fetchServices: async () => {
    const slug = get().tenantSlug;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/public/bookings/services`, {
        headers: { 'x-tenant-slug': slug },
      });
      if (!res.ok) throw new Error('Could not load services.');
      const data = await res.json();
      set({ services: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectService: (service) => {
    set({
      selectedService: service,
      selectedStaff: null,
      selectedSlot: null,
      availableSlots: [],
    });
    get().trackEvent('service_selected', { serviceId: service.id, serviceName: service.name });
  },

  // ─── Fetch branches ────────────────────────────────────────
  fetchBranches: async () => {
    const slug = get().tenantSlug;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/public/bookings/branches`, {
        headers: { 'x-tenant-slug': slug },
      });
      if (!res.ok) throw new Error('Could not load branches.');
      const data = await res.json();
      set({ branches: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectBranch: (branchId) => {
    set({ selectedBranchId: branchId, selectedStaff: null, selectedSlot: null, availableSlots: [] });
  },

  // ─── Fetch staff ───────────────────────────────────────────
  fetchStaff: async () => {
    const { tenantSlug, selectedService } = get();
    if (!selectedService) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/public/bookings/staff?serviceId=${selectedService.id}`, {
        headers: { 'x-tenant-slug': tenantSlug },
      });
      if (!res.ok) throw new Error('Could not load stylists.');
      const data = await res.json();
      set({ staffList: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectStaff: (staff) => {
    set({ selectedStaff: staff, selectedSlot: null, availableSlots: [] });
    get().trackEvent('stylist_selected', {
      staffId: staff?.id || 'any',
      staffName: staff?.name || 'Any Available',
    });
  },

  // ─── Date + Slots ──────────────────────────────────────────
  selectDate: (date) => {
    set({ selectedDate: date, selectedSlot: null, availableSlots: [] });
    get().trackEvent('date_selected', { date: date?.toISOString().split('T')[0] });
  },

  fetchSlots: async () => {
    const { tenantSlug, selectedService, selectedStaff, selectedDate } = get();
    if (!selectedService || !selectedDate) return;
    set({ isLoading: true, error: null });

    const dateStr = selectedDate.toISOString().split('T')[0];
    const params = new URLSearchParams({
      date: dateStr,
      serviceId: selectedService.id,
    });
    if (selectedStaff) params.set('staffId', selectedStaff.id);

    try {
      const res = await fetch(`${API_BASE}/api/public/bookings/slots?${params}`, {
        headers: { 'x-tenant-slug': tenantSlug },
      });
      if (!res.ok) throw new Error('Could not load available times.');
      const data = await res.json();
      set({ availableSlots: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectSlot: (slot) => {
    set({ selectedSlot: slot });
    get().trackEvent('slot_selected', {
      startTime: slot?.startTime,
      staffId: slot?.staffId,
    });
  },

  // ─── Customer details ─────────────────────────────────────
  updateCustomer: (field, value) =>
    set((s) => ({ customer: { ...s.customer, [field]: value } })),

  // ─── Returning customer lookup ─────────────────────────────
  lookupCustomer: async (phone) => {
    const { tenantSlug } = get();
    if (!phone || phone.replace(/\D/g, '').length < 5) return null;
    try {
      const res = await fetch(
        `${API_BASE}/api/public/bookings/customer-lookup?phone=${encodeURIComponent(phone)}`,
        { headers: { 'x-tenant-slug': tenantSlug } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.firstName) {
        set({
          customer: {
            firstName: data.firstName,
            lastName: data.lastName || '',
            email: data.email || '',
            phone,
            notes: '',
          },
          isReturningCustomer: true,
        });
        return data;
      }
      return null;
    } catch {
      return null;
    }
  },

  // ─── Hold slot ─────────────────────────────────────────────
  holdSelectedSlot: async () => {
    const { tenantSlug, selectedService, selectedSlot } = get();
    if (!selectedSlot) return;
    try {
      const res = await fetch(`${API_BASE}/api/public/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedSlot.staffId,
          startTime: selectedSlot.startTime,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ holdToken: data.holdToken || null });
      }
    } catch {
      // Hold is optional — silently fail
    }
  },

  // ─── Lead capture on abandonment ───────────────────────────
  captureAbandonment: () => {
    const { tenantSlug, customer, selectedService, flow, stepIndex } = get();
    // Only capture if user has entered some details
    if (!customer.phone && !customer.email) return;
    try {
      const payload = JSON.stringify({
        slug: tenantSlug,
        phone: customer.phone,
        email: customer.email,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        service: selectedService?.name,
        abandonedAtStep: flow[stepIndex],
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE}/api/public/bookings/lead`, payload);
      }
    } catch {
      // Fire-and-forget
    }
  },

  // ─── Create booking ────────────────────────────────────────
  submitBooking: async () => {
    const { tenantSlug, selectedService, selectedSlot, customer, holdToken, flow } = get();
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedSlot.staffId,
          startTime: selectedSlot.startTime,
          holdToken: holdToken || undefined,
          customer: {
            firstName: customer.firstName.trim(),
            lastName: customer.lastName.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim() || undefined,
          },
          notes: customer.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed. Please try again.');

      // Navigate to success step (last in flow)
      const successIdx = flow.indexOf('success');
      set({
        bookingResult: data.booking,
        isLoading: false,
        stepIndex: successIdx !== -1 ? successIdx : flow.length - 1,
      });
      get().trackEvent('booking_completed', { bookingId: data.booking?.id });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ─── Reset ─────────────────────────────────────────────────
  reset: () => set({
    stepIndex: 0,
    services: [],
    branches: [],
    staffList: [],
    availableSlots: [],
    selectedService: null,
    selectedBranchId: null,
    selectedStaff: null,
    selectedDate: null,
    selectedSlot: null,
    customer: { firstName: '', lastName: '', phone: '', email: '', notes: '' },
    isReturningCustomer: false,
    bookingResult: null,
    holdToken: null,
    isLoading: false,
    error: null,
  }),
}));

export default useBookingStore;
