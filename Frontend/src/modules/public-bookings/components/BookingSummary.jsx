'use client';

import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { Sparkles, User, Calendar, Clock, ChevronUp, ChevronDown, Timer } from 'lucide-react';
import { Badge, Card, CardBody } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';

export default function BookingSummary() {
  const { t } = useTranslation();
  const service = useBookingStore((state) => state.service);
  const staff = useBookingStore((state) => state.staff);
  const date = useBookingStore((state) => state.date);
  const slot = useBookingStore((state) => state.slot);
  const holdExpiresAt = useBookingStore((state) => state.holdExpiresAt);

  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Handle countdown calculation for Redis slot holds
  useEffect(() => {
    if (!holdExpiresAt) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const difference = new Date(holdExpiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(difference / 1000 / 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const hasSelections = service || staff || (date && slot);

  // Formatter for date
  const getReadableDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to format ISO time to user friendly display (e.g. 10:30 AM)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const dateObj = new Date(isoString);
    let hours = dateObj.getUTCHours();
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Render the core summary content
  const SummaryDetails = () => (
    <div className="space-y-4">
      {/* Service */}
      {service ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-2.5">
            <Sparkles className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">{t('booking.summary_service')}</p>
              <p className="text-sm font-semibold text-white">{service.name}</p>
              <p className="text-xs text-neutral-400">{service.duration} mins</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gradient">${Number(service.price).toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-neutral-500 italic py-1">{t('booking.select_service_label')}</p>
      )}

      {/* Stylist */}
      {service && (
        <div className="flex items-start gap-2.5 border-t border-white/5 pt-3">
          <User className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">{t('booking.summary_stylist')}</p>
            <p className="text-sm font-semibold text-white">
              {staff ? staff.name : <span className="text-neutral-500 italic">{t('booking.select_stylist_label')}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Date & Time */}
      {service && staff && (
        <div className="flex items-start gap-2.5 border-t border-white/5 pt-3">
          <Calendar className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">{t('booking.summary_date_time')}</p>
            {slot ? (
              <p className="text-sm font-semibold text-white flex flex-col">
                <span>{getReadableDate(date)}</span>
                <span className="text-xs text-amber-300 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(slot.startTime)}
                </span>
              </p>
            ) : (
              <span className="text-sm text-neutral-500 italic">{t('booking.select_slot_label')}</span>
            )}
          </div>
        </div>
      )}

      {/* Slot Hold Timer */}
      {timeLeft && (
        <div className="flex items-center gap-2 border-t border-white/5 pt-3 text-xs justify-center rounded-xl bg-amber-500/5 py-2">
          <Timer className={`h-4 w-4 ${timeLeft === 'Expired' ? 'text-rose-400' : 'text-amber-400 animate-pulse'}`} />
          <span className="font-bold text-neutral-300">
            {timeLeft === 'Expired' ? t('booking.slot_hold_expired') : `${t('booking.slot_held_for')} ${timeLeft}`}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ==================== DESKTOP SIDEBAR PANEL ==================== */}
      <aside className="hidden lg:block rounded-2xl border border-white/10 bg-[#0c0c10]/95 p-6 shadow-xl sticky top-8 max-h-[85vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">{t('booking.summary_title')}</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{t('booking.summary_title')}</h3>
            </div>
            <div className="rounded-full bg-amber-500/10 border border-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wide">
              {t('booking.live')}
            </div>
          </div>
          
          <SummaryDetails />

          {/* Price Total */}
          {service && (
            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-400">{t('booking.total_price')}</span>
              <span className="text-xl font-black text-gradient">${Number(service.price).toFixed(2)}</span>
            </div>
          )}
        </div>
      </aside>

      {/* ==================== MOBILE STICKY BOTTOM SHEET ==================== */}
      <aside className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0c0c10]/98 shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Toggle Bar */}
        <button
          onClick={() => hasSelections && setMobileExpanded(!mobileExpanded)}
          className="flex w-full items-center justify-center py-2 text-neutral-500 border-b border-white/5 hover:text-white"
          disabled={!hasSelections}
        >
          {mobileExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        {/* Collapsed Bar State */}
        {!mobileExpanded && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="space-y-0.5">
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wide">{t('booking.summary_title')}</p>
              <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                {service ? service.name : t('booking.select_service_label')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {service && (
                <span className="text-base font-black text-gradient">${Number(service.price).toFixed(2)}</span>
              )}
            </div>
          </div>
        )}

        {/* Expanded Sheet State */}
        {mobileExpanded && (
          <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
            <SummaryDetails />
            
            {service && (
              <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-400">{t('booking.total_price')}</span>
                <span className="text-lg font-black text-gradient">${Number(service.price).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
