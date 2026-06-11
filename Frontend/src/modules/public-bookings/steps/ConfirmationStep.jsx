'use client';

import { useBookingStore } from '../store/bookingStore';
import { CheckCircle2, Calendar, User, Sparkles, Phone, Mail, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function ConfirmationStep({ onStartOver }) {
  const { t } = useTranslation();
  const createdBooking = useBookingStore((state) => state.createdBooking);

  if (!createdBooking) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-neutral-400 text-sm">
        No booking data found. Please select and create a booking.
      </div>
    );
  }

  // Format ISO time to readable format
  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    let hours = d.getUTCHours();
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime(createdBooking.startTime);

  return (
    <div className="space-y-8 py-4 text-center">
      {/* 1. Header Success State */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 opacity-75" />
          <CheckCircle2 className="relative h-16 w-16 text-emerald-400" />
        </div>
        
        <h3 className="text-2xl font-black text-white">Booking Confirmed!</h3>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Your appointment has been successfully reserved. A summary has been registered in our system.
        </p>
      </div>

      {/* 2. Reference ID Card */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 py-4 px-6 inline-block">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Appointment Reference</span>
        <p className="text-xl font-black tracking-widest text-gradient mt-1">{createdBooking.bookingReference}</p>
      </div>

      {/* 3. Summary Detail Sheet */}
      <div className="text-left rounded-2xl border border-white/5 bg-black/20 p-6 space-y-4 max-w-xl mx-auto">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-white/5 pb-2">
          Appointment Details
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Service</span>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {createdBooking.serviceName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Stylist</span>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-amber-300" />
              {createdBooking.staffName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Date</span>
            <p className="text-sm font-bold text-white">{dateStr}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Time</span>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-300" />
              {timeStr}
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-1">
            Client Details
          </h4>
          
          <div className="grid gap-2 text-xs text-neutral-300 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-neutral-500" />
              <span>{createdBooking.customerName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-neutral-500" />
              <span>{createdBooking.customerPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-md mx-auto pt-4">
        <button
          onClick={onStartOver}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          Book Another
        </button>
        
        <button
          onClick={() => window.print()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-3 text-sm font-bold text-black hover:from-amber-300 hover:to-amber-500 transition"
        >
          Print Summary
        </button>
      </div>
    </div>
  );
}
