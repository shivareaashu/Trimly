'use client';

import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { bookingApi } from '../services/bookingApi';
import { Sparkles, Clock, DollarSign } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function ServiceStep({ onNext }) {
  const { t } = useTranslation();
  const selectedService = useBookingStore((state) => state.service);
  const setService = useBookingStore((state) => state.setService);
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const data = await bookingApi.getServices();
        setServices(data);
      } catch (err) {
        setError(err.message || 'Failed to load services. Please check connection.');
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleSelect = (service) => {
    setService(service);
    // Auto-advance to staff step for smoother UX
    setTimeout(onNext, 300);
  };

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-28 w-full animate-pulse rounded-2xl border border-white/5 bg-white/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-6 text-center">
        <p className="text-sm text-rose-200">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/15"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          {t('booking.select_service')}
        </h3>
        <p className="text-sm text-neutral-400">Choose a service from our menu to customize your treatment.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        {services.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-6">No services are currently available for booking.</p>
        ) : (
          services.map((srv) => {
            const isSelected = selectedService?.id === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => handleSelect(srv)}
                className={`group relative flex w-full flex-col justify-between rounded-2xl border text-left p-5 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-amber-400/50 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                    : 'border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/10'
                }`}
              >
                {/* Visual Active Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                )}
                
                <div className="space-y-2">
                  <p className={`font-bold transition-colors ${isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-300'}`}>
                    {srv.name}
                  </p>
                  {srv.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 max-w-xl">{srv.description}</p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 w-full">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{srv.duration} mins</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 text-base font-black text-white">
                    <span className="text-xs text-amber-200/80">$</span>
                    <span className="text-gradient font-black">{Number(srv.price).toFixed(2)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
