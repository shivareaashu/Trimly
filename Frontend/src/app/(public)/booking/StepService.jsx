'use client';

import { useEffect, useState } from 'react';
import { Search, Clock, Sparkles, Check } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

const SERVICE_ICONS = {
  hair: '💇',
  skin: '✨',
  nail: '💅',
  spa: '🧖',
  makeup: '💄',
  beard: '🧔',
  massage: '💆',
  facial: '🧴',
  wax: '🕯️',
  default: '✂️',
};

function getServiceIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return SERVICE_ICONS.default;
}

function formatDuration(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatPrice(price) {
  if (price == null) return '';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function StepService() {
  const { services, selectedService, fetchServices, selectService, nextStep, isLoading } = useBookingStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (services.length === 0) fetchServices();
  }, []);

  const filtered = query
    ? services.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(query.toLowerCase())
      )
    : services;

  const handleSelect = (service) => {
    selectService(service);
  };

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <Sparkles size={12} />
        Choose Service
      </div>
      <h2 className="bk-title">What would you like?</h2>
      <p className="bk-subtitle">Select a service to get started</p>

      {/* Search */}
      <div className="bk-search">
        <Search size={16} className="bk-search-icon" />
        <input
          type="text"
          placeholder="Search services..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="bk-loading"><div className="bk-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="bk-empty">
          <div className="bk-empty-icon">🔍</div>
          <p>No services found</p>
        </div>
      ) : (
        <div className="bk-card-grid">
          {filtered.map((service) => (
            <div
              key={service.id}
              className={`bk-card${selectedService?.id === service.id ? ' selected' : ''}`}
              onClick={() => handleSelect(service)}
            >
              <div className="bk-card-check"><Check size={12} /></div>
              <div className="bk-card-icon">{getServiceIcon(service.name)}</div>
              <div className="bk-card-name">{service.name}</div>
              {service.description && (
                <div className="bk-card-meta" style={{ marginBottom: 4 }}>
                  {service.description}
                </div>
              )}
              <div className="bk-card-meta">
                <Clock size={12} />
                <span>{formatDuration(service.duration)}</span>
              </div>
              <div className="bk-card-price">{formatPrice(service.price)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bk-actions">
        <button
          className="bk-btn-primary"
          disabled={!selectedService}
          onClick={nextStep}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
