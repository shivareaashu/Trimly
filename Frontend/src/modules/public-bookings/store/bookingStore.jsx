import { create } from 'zustand';

const initialCustomerState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export const useBookingStore = create((set, get) => ({
  // Booking Selection State
  service: null, // { id, name, price, duration }
  staff: null, // { id, name }
  date: null, // 'YYYY-MM-DD'
  slot: null, // { startTime, endTime, staffId }
  
  // Guest Details Form State
  customer: { ...initialCustomerState },
  notes: '',
  botField: '', // Honeypot field
  
  // Redis Temporary Hold State
  holdToken: null,
  holdExpiresAt: null,
  
  // Booking Result/Success State
  createdBooking: null,

  // Actions
  setService: (service) => {
    // If selecting a different service, clear downstream selections
    const currentService = get().service;
    if (!currentService || currentService.id !== service.id) {
      set({
        service,
        staff: null,
        date: null,
        slot: null,
        holdToken: null,
        holdExpiresAt: null,
      });
    } else {
      set({ service });
    }
  },

  setStaff: (staff) => {
    const currentStaff = get().staff;
    if (!currentStaff || currentStaff.id !== staff.id) {
      set({
        staff,
        date: null,
        slot: null,
        holdToken: null,
        holdExpiresAt: null,
      });
    } else {
      set({ staff });
    }
  },

  setDate: (date) => {
    const currentDate = get().date;
    if (currentDate !== date) {
      set({
        date,
        slot: null,
        holdToken: null,
        holdExpiresAt: null,
      });
    } else {
      set({ date });
    }
  },

  setSlot: (slot) => {
    set({
      slot,
      holdToken: null,
      holdExpiresAt: null,
    });
  },

  setHold: (holdToken, expiresAt) => {
    set({
      holdToken,
      holdExpiresAt: expiresAt,
    });
  },

  setCustomer: (fields) => {
    set((state) => ({
      customer: {
        ...state.customer,
        ...fields,
      },
    }));
  },

  setNotes: (notes) => {
    set({ notes });
  },

  setBotField: (botField) => {
    set({ botField });
  },

  setBookingResult: (booking) => {
    set({ createdBooking: booking });
  },

  resetStore: () => {
    set({
      service: null,
      staff: null,
      date: null,
      slot: null,
      customer: { ...initialCustomerState },
      notes: '',
      botField: '',
      holdToken: null,
      holdExpiresAt: null,
      createdBooking: null,
    });
  },

  // Helper validation getters
  isServiceSelected: () => !!get().service,
  isStaffSelected: () => !!get().staff,
  isDateSlotSelected: () => !!get().date && !!get().slot,
  isDetailsFilled: () => {
    const { firstName, lastName, phone } = get().customer;
    return !!(firstName.trim() && lastName.trim() && phone.trim() && phone.trim().length >= 5);
  },
}));
