'use client';

import { CheckCircle, Copy, CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { useBookingStore } from './useBookingStore';

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

export default function StepSuccess() {
  const { bookingResult, reset } = useBookingStore();
  const [copied, setCopied] = useState(false);

  const refId = bookingResult?.bookingReference || bookingResult?.id || 'N/A';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div className="bk-step-enter bk-success">
      <div className="bk-success-icon">
        <CheckCircle size={36} color="#22C55E" />
      </div>

      <h2 className="bk-title" style={{ fontSize: '1.5rem' }}>You're all set!</h2>
      <p className="bk-subtitle" style={{ maxWidth: 280 }}>
        Your appointment has been confirmed. We look forward to seeing you!
      </p>

      <div className="bk-success-ref" onClick={handleCopy} style={{ cursor: 'pointer' }}>
        <CalendarCheck size={16} color="var(--bk-gold)" />
        <span>{refId}</span>
        <Copy size={12} color="var(--bk-muted)" />
      </div>
      {copied && (
        <span style={{ fontSize: '0.75rem', color: 'var(--bk-success)', marginTop: 6 }}>
          Copied to clipboard!
        </span>
      )}

      {bookingResult && (
        <div className="bk-review" style={{ marginTop: 24, width: '100%', textAlign: 'left' }}>
          <div className="bk-review-header">Booking Details</div>
          {bookingResult.serviceName && (
            <div className="bk-review-row">
              <span className="bk-review-label">Service</span>
              <span className="bk-review-value">{bookingResult.serviceName}</span>
            </div>
          )}
          {bookingResult.staffName && (
            <div className="bk-review-row">
              <span className="bk-review-label">Stylist</span>
              <span className="bk-review-value">{bookingResult.staffName}</span>
            </div>
          )}
          {bookingResult.startTime && (
            <div className="bk-review-row">
              <span className="bk-review-label">Date</span>
              <span className="bk-review-value">{formatDate(bookingResult.startTime)}</span>
            </div>
          )}
          {bookingResult.startTime && (
            <div className="bk-review-row">
              <span className="bk-review-label">Time</span>
              <span className="bk-review-value">{formatTime(bookingResult.startTime)}</span>
            </div>
          )}
          {bookingResult.customerName && (
            <div className="bk-review-row">
              <span className="bk-review-label">Name</span>
              <span className="bk-review-value">{bookingResult.customerName}</span>
            </div>
          )}
        </div>
      )}

      <div className="bk-actions" style={{ width: '100%' }}>
        <button className="bk-btn-primary" onClick={reset}>
          Book Another Appointment
        </button>
      </div>
    </div>
  );
}
