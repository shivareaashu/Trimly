'use client';

import { Sparkles, Phone, MessageCircle } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

export default function StepWelcome() {
  const { tenantConfig, nextStep } = useBookingStore();

  const salonName = tenantConfig?.name || 'Our Salon';

  return (
    <div className="bk-welcome bk-step-enter">
      <div className="bk-welcome-logo">
        <Sparkles size={28} />
      </div>
      <h1 className="bk-title">Welcome to {salonName}</h1>
      <p className="bk-subtitle">
        Book your appointment in under 60 seconds.
      </p>
      <div className="bk-welcome-cta">
        <button className="bk-btn-primary" onClick={nextStep}>
          <Sparkles size={16} />
          Book Appointment
        </button>
        <button className="bk-btn-secondary" onClick={() => window.open('tel:', '_self')}>
          <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
          Call Salon
        </button>
        <button className="bk-btn-secondary" onClick={() => window.open('https://wa.me/', '_blank')}>
          <MessageCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
