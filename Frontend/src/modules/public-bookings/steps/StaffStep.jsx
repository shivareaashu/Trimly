'use client';

import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { bookingApi } from '../services/bookingApi';
import { User, Sparkles, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function StaffStep({ onNext }) {
  const { t } = useTranslation();
  const service = useBookingStore((state) => state.service);
  const selectedStaff = useBookingStore((state) => state.staff);
  const setStaff = useBookingStore((state) => state.setStaff);

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStaff() {
      if (!service) return;
      try {
        setLoading(true);
        const data = await bookingApi.getStaff(service.id);
        setStaffList(data);
      } catch (err) {
        setError(err.message || 'Failed to load staff profiles.');
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, [service]);

  const handleSelect = (staff) => {
    setStaff(staff);
    setTimeout(onNext, 300);
  };

  if (!service) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-neutral-400 text-sm">
        Please select a service first.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 py-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-24 w-full animate-pulse rounded-2xl border border-white/5 bg-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-6 text-center">
        <p className="text-sm text-rose-200">{error}</p>
      </div>
    );
  }

  const anyStaffOption = { id: 'any', name: 'First Available Staff', bio: 'Select this to see all available time slots.' };
  const allStylists = [anyStaffOption, ...staffList];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          {t('booking.select_staff')}
        </h3>
        <p className="text-sm text-neutral-400">Choose a stylist or select 'First Available' for maximum slot availability.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {allStylists.map((stf) => {
          const isSelected = selectedStaff?.id === stf.id;
          const isAny = stf.id === 'any';

          return (
            <button
              key={stf.id}
              onClick={() => handleSelect(stf)}
              className={`group relative flex w-full gap-4 rounded-2xl border text-left p-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-amber-400/50 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                  : 'border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/10'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
              )}

              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold border transition-colors ${
                isSelected
                  ? 'bg-amber-400 text-black border-amber-400'
                  : isAny
                  ? 'bg-neutral-800 text-amber-400 border-neutral-700'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}>
                {isAny ? <Sparkles className="h-5 w-5" /> : stf.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <p className={`font-bold transition-colors ${isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-300'}`}>
                  {stf.name}
                </p>
                {stf.bio && (
                  <p className="text-xs text-neutral-400 line-clamp-2">{stf.bio}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
