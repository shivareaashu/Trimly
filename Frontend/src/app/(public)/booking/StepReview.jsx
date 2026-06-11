'use client';

import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const hours = d.getUTCHours();
  const mins = d.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(mins).padStart(2, '0')} ${ampm}`;
}

function formatPrice(price) {
  if (price == null) return '—';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function StepReview() {
  const {
    selectedService,
    selectedStaff,
    selectedDate,
    selectedSlot,
    customer,
    submitBooking,
    prevStep,
    isLoading,
    error,
  } = useBookingStore();

  const staffDisplay = selectedSlot?.staffName || selectedStaff?.name || 'Any Available';

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <ShieldCheck size={12} />
        Confirm Booking
      </div>
      <h2 className="bk-title">Review your appointment</h2>
      <p className="bk-subtitle">Please verify the details below</p>

      {error && (
        <div className="bk-error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="bk-review">
        <div className="bk-review-header">Appointment Summary</div>
        <div className="bk-review-row">
          <span className="bk-review-label">Service</span>
          <span className="bk-review-value">{selectedService?.name}</span>
        </div>
        <div className="bk-review-row">
          <span className="bk-review-label">Stylist</span>
          <span className="bk-review-value">{staffDisplay}</span>
        </div>
        <div className="bk-review-row">
          <span className="bk-review-label">Date</span>
          <span className="bk-review-value">{formatDate(selectedDate)}</span>
        </div>
        <div className="bk-review-row">
          <span className="bk-review-label">Time</span>
          <span className="bk-review-value">{formatTime(selectedSlot?.startTime)}</span>
        </div>
        <div className="bk-review-row">
          <span className="bk-review-label">Customer</span>
          <span className="bk-review-value">{customer.firstName} {customer.lastName}</span>
        </div>
        <div className="bk-review-row">
          <span className="bk-review-label">Phone</span>
          <span className="bk-review-value">{customer.phone}</span>
        </div>
        {customer.email && (
          <div className="bk-review-row">
            <span className="bk-review-label">Email</span>
            <span className="bk-review-value">{customer.email}</span>
          </div>
        )}
        <div className="bk-review-row" style={{ background: 'rgba(212,175,55,0.04)' }}>
          <span className="bk-review-label" style={{ color: 'var(--bk-gold)' }}>Price</span>
          <span className="bk-review-value" style={{ color: 'var(--bk-gold)', fontSize: '1.125rem' }}>
            {formatPrice(selectedService?.price)}
          </span>
        </div>
      </div>

      {customer.notes && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bk-surface)', border: '1px solid var(--bk-border)', fontSize: '0.8125rem', color: 'var(--bk-muted)' }}>
          <strong style={{ color: 'var(--bk-ivory)' }}>Notes:</strong> {customer.notes}
        </div>
      )}

      <div className="bk-actions">
        <button className="bk-btn-primary" onClick={submitBooking} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="bk-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </button>
        <button className="bk-btn-secondary" onClick={prevStep} disabled={isLoading}>
          Back
        </button>
      </div>
    </div>
  );
}
