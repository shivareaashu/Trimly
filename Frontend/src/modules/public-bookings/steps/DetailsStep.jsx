'use client';

import { useBookingStore } from '../store/bookingStore';
import { User, Mail, Phone, FileText, ShieldCheck } from 'lucide-react';

export default function DetailsStep() {
  const customer = useBookingStore((state) => state.customer);
  const notes = useBookingStore((state) => state.notes);
  const botField = useBookingStore((state) => state.botField);
  
  const setCustomer = useBookingStore((state) => state.setCustomer);
  const setNotes = useBookingStore((state) => state.setNotes);
  const setBotField = useBookingStore((state) => state.setBotField);

  const handleCustomerChange = (field) => (e) => {
    setCustomer({ [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          Contact & Preferences
        </h3>
        <p className="text-sm text-neutral-400">Provide your details to complete and secure your appointment reservation.</p>
      </div>

      <div className="space-y-4">
        {/* Honeypot Spam Protection Field - Completely hidden from humans */}
        <div className="absolute top-0 left-0 -z-50 h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="botField">Leave this field empty if you are a human</label>
          <input
            id="botField"
            type="text"
            tabIndex="-1"
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
            autoComplete="off"
            placeholder="Do not fill this"
          />
        </div>

        {/* First & Last Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <User className="h-3.5 w-3.5 text-amber-200/60" />
              First Name *
            </label>
            <input
              type="text"
              value={customer.firstName}
              onChange={handleCustomerChange('firstName')}
              placeholder="Amit"
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/40 focus:bg-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <User className="h-3.5 w-3.5 text-amber-200/60" />
              Last Name *
            </label>
            <input
              type="text"
              value={customer.lastName}
              onChange={handleCustomerChange('lastName')}
              placeholder="Sharma"
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/40 focus:bg-white/10"
              required
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Mail className="h-3.5 w-3.5 text-amber-200/60" />
              Email Address
            </label>
            <input
              type="email"
              value={customer.email}
              onChange={handleCustomerChange('email')}
              placeholder="amit@example.com"
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/40 focus:bg-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Phone className="h-3.5 w-3.5 text-amber-200/60" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={handleCustomerChange('phone')}
              placeholder="+91 98765 43210"
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/40 focus:bg-white/10"
              required
            />
          </div>
        </div>

        {/* Notes Preference */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <FileText className="h-3.5 w-3.5 text-amber-200/60" />
            Special Requests / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Tell us about any preferences, hair length, allergies, or stylistic requests..."
            className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/40 focus:bg-white/10"
          />
        </div>
      </div>
    </div>
  );
}
