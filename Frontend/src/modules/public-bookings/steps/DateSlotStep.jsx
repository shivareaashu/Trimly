'use client';

import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { bookingApi } from '../services/bookingApi';
import { Calendar, Clock, Sparkles, Sun, Sunset, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function DateSlotStep({ onNext }) {
  const { t } = useTranslation();
  const service = useBookingStore((state) => state.service);
  const staff = useBookingStore((state) => state.staff);
  const selectedDate = useBookingStore((state) => state.date);
  const selectedSlot = useBookingStore((state) => state.slot);
  
  const setDate = useBookingStore((state) => state.setDate);
  const setSlot = useBookingStore((state) => state.setSlot);
  const setHold = useBookingStore((state) => state.setHold);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Generate next 14 days for the horizontal calendar slider
  const [datesList, setDatesList] = useState([]);
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    setDatesList(dates);
    
    // Auto-select today's date if none is selected
    if (!selectedDate && dates.length > 0) {
      const todayStr = formatDate(dates[0]);
      setDate(todayStr);
    }
  }, []);

  // Format Date to YYYY-MM-DD
  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Load slots when date/service/staff changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !service) return;
      try {
        setLoading(true);
        setError('');
        setSuccessMsg('');
        const staffIdParam = staff?.id === 'any' ? undefined : staff?.id;
        const data = await bookingApi.getSlots(selectedDate, service.id, staffIdParam);
        setSlots(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch slots.');
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, [selectedDate, service, staff]);

  // Handle slot selection (triggers hold API)
  const handleSlotSelect = async (slot) => {
    try {
      setHolding(true);
      setError('');
      setSuccessMsg('');
      
      // Place hold in Redis
      const holdResult = await bookingApi.holdSlot(
        service.id,
        slot.staffId,
        slot.startTime
      );
      
      // Update store state
      setSlot({
        startTime: slot.startTime,
        endTime: slot.endTime,
        staffId: slot.staffId,
        staffName: slot.staffName,
      });
      setHold(holdResult.holdToken, holdResult.expiresAt);
      
      setSuccessMsg(t('booking.slot_held_success'));
      
      // Auto-advance to details step
      setTimeout(onNext, 600);
    } catch (err) {
      setError(err.message || 'Could not hold this slot. It might have been booked recently.');
      // Refresh slots list to reflect current availability
      if (selectedDate && service) {
        const staffIdParam = staff?.id === 'any' ? undefined : staff?.id;
        const data = await bookingApi.getSlots(selectedDate, service.id, staffIdParam);
        setSlots(data);
      }
    } finally {
      setHolding(false);
    }
  };

  // Group slots by time of day
  const getGroupedSlots = () => {
    const morning = []; // before 12:00
    const afternoon = []; // 12:00 to 17:00
    const evening = []; // after 17:00

    slots.forEach(slot => {
      const timeStr = new Date(slot.startTime).getUTCHours();
      if (timeStr < 12) {
        morning.push(slot);
      } else if (timeStr < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = getGroupedSlots();

  const handleCustomDateChange = (e) => {
    if (e.target.value) {
      setDate(e.target.value);
    }
  };

  // Helper to format ISO time to user friendly display (e.g. 10:30 AM)
  const formatTime = (isoString) => {
    const dateObj = new Date(isoString);
    let hours = dateObj.getUTCHours();
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-400" />
          {t('booking.select_date')}
        </h3>
        <p className="text-sm text-neutral-400">{t('booking.select_date_subtitle')}</p>
      </div>

      {/* 1. Date Slider Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{t('booking.days_menu')}</span>
          
          {/* Custom Date Input for booking further out */}
          <div className="relative flex items-center">
            <span className="text-xs text-neutral-400 mr-2">{t('booking.custom_date')}</span>
            <input
              type="date"
              value={selectedDate || ''}
              min={formatDate(new Date())}
              onChange={handleCustomDateChange}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-amber-400/40 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {datesList.map((d, index) => {
            const dateStr = formatDate(d);
            const isSelected = selectedDate === dateStr;
            const dayNum = d.getDate();
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const monthName = d.toLocaleDateString('en-US', { month: 'short' });

            return (
              <button
                key={index}
                onClick={() => setDate(dateStr)}
                className={`flex flex-col items-center justify-center min-w-[4.5rem] rounded-xl border py-3 px-2 text-center transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 text-white font-bold shadow-md shadow-amber-500/5'
                    : 'border-white/5 bg-white/5 text-neutral-400 hover:border-white/15 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-60">{dayName}</span>
                <span className="text-lg font-black my-0.5">{dayNum}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60">{monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 px-4 py-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-300 animate-bounce">
          {successMsg}
        </div>
      )}

      {/* 2. Available Slots Grid */}
      <div className="space-y-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{t('booking.available_slots')}</h4>
        
        {loading ? (
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 py-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-10 animate-pulse rounded-lg border border-white/5 bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-black/10 py-8 text-center text-sm text-neutral-500">
            {t('booking.no_slots')}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Morning Section */}
            {morning.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sun className="h-3.5 w-3.5 text-amber-300" />
                  {t('booking.morning')}
                </h5>
                <div className="grid gap-2 grid-cols-3 sm:grid-cols-4">
                  {morning.map((slot, index) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={index}
                        disabled={holding}
                        onClick={() => handleSlotSelect(slot)}
                        className={`rounded-xl border py-2.5 text-xs text-center font-semibold transition ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/20'
                            : 'border-white/5 bg-white/5 text-white hover:border-amber-400/40 hover:bg-white/10'
                        } disabled:opacity-50`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Afternoon Section */}
            {afternoon.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sunset className="h-3.5 w-3.5 text-amber-400" />
                  {t('booking.afternoon')}
                </h5>
                <div className="grid gap-2 grid-cols-3 sm:grid-cols-4">
                  {afternoon.map((slot, index) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={index}
                        disabled={holding}
                        onClick={() => handleSlotSelect(slot)}
                        className={`rounded-xl border py-2.5 text-xs text-center font-semibold transition ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/20'
                            : 'border-white/5 bg-white/5 text-white hover:border-amber-400/40 hover:bg-white/10'
                        } disabled:opacity-50`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evening Section */}
            {evening.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Moon className="h-3.5 w-3.5 text-amber-200" />
                  {t('booking.evening')}
                </h5>
                <div className="grid gap-2 grid-cols-3 sm:grid-cols-4">
                  {evening.map((slot, index) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={index}
                        disabled={holding}
                        onClick={() => handleSlotSelect(slot)}
                        className={`rounded-xl border py-2.5 text-xs text-center font-semibold transition ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/20'
                            : 'border-white/5 bg-white/5 text-white hover:border-amber-400/40 hover:bg-white/10'
                        } disabled:opacity-50`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
