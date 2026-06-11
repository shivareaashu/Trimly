'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { UserRound, Mail, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function StepDetails() {
  const {
    customer,
    updateCustomer,
    nextStep,
    prevStep,
    lookupCustomer,
    isReturningCustomer,
    trackEvent,
  } = useBookingStore();

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState(null);
  const debouncedPhone = useDebounce(customer.phone, 600);
  const lookupTriggered = useRef(false);

  // Auto-lookup when phone has enough digits
  useEffect(() => {
    const digits = debouncedPhone.replace(/\D/g, '');
    if (digits.length >= 10 && !lookupDone && !lookupTriggered.current) {
      lookupTriggered.current = true;
      setIsLookingUp(true);
      lookupCustomer(debouncedPhone).then((result) => {
        setIsLookingUp(false);
        setLookupDone(true);
        if (result) {
          setWelcomeBack(result.firstName);
        }
      });
    }
  }, [debouncedPhone]);

  // Reset lookup when phone changes significantly
  useEffect(() => {
    const digits = customer.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      lookupTriggered.current = false;
      setLookupDone(false);
      setWelcomeBack(null);
    }
  }, [customer.phone]);

  const isValid = customer.firstName.trim().length > 0
    && customer.lastName.trim().length > 0
    && customer.phone.trim().replace(/\D/g, '').length >= 5;

  const handleContinue = () => {
    trackEvent('details_entered', {
      isReturning: isReturningCustomer,
    });
    nextStep();
  };

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <UserRound size={12} />
        Your Details
      </div>
      <h2 className="bk-title">Almost there!</h2>
      <p className="bk-subtitle">We just need a few details to confirm your booking</p>

      {/* Phone first — enables returning customer lookup */}
      <div className="bk-input-group">
        <label className="bk-input-label">
          <Phone size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Phone Number *
        </label>
        <div style={{ position: 'relative' }}>
          <input
            className="bk-input"
            type="tel"
            placeholder="+91 98765 43210"
            value={customer.phone}
            onChange={(e) => updateCustomer('phone', e.target.value)}
            autoFocus
          />
          {isLookingUp && (
            <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <div className="bk-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            </div>
          )}
        </div>
      </div>

      {/* Welcome back banner */}
      {welcomeBack && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))',
          border: '1px solid rgba(34,197,94,0.2)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Sparkles size={18} color="#22C55E" />
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#22C55E' }}>
              Welcome back, {welcomeBack}!
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bk-muted)', marginTop: 2 }}>
              We found your profile. Details auto-filled.
            </div>
          </div>
        </div>
      )}

      <div className="bk-input-row">
        <div className="bk-input-group">
          <label className="bk-input-label">First Name *</label>
          <input
            className="bk-input"
            type="text"
            placeholder="Priya"
            value={customer.firstName}
            onChange={(e) => updateCustomer('firstName', e.target.value)}
          />
        </div>
        <div className="bk-input-group">
          <label className="bk-input-label">Last Name *</label>
          <input
            className="bk-input"
            type="text"
            placeholder="Sharma"
            value={customer.lastName}
            onChange={(e) => updateCustomer('lastName', e.target.value)}
          />
        </div>
      </div>

      <div className="bk-input-group">
        <label className="bk-input-label">
          <Mail size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Email (optional)
        </label>
        <input
          className="bk-input"
          type="email"
          placeholder="priya@example.com"
          value={customer.email}
          onChange={(e) => updateCustomer('email', e.target.value)}
        />
      </div>

      <div className="bk-input-group">
        <label className="bk-input-label">
          <MessageSquare size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Notes (optional)
        </label>
        <textarea
          className="bk-input bk-textarea"
          placeholder="Any preferences or special requests..."
          value={customer.notes}
          onChange={(e) => updateCustomer('notes', e.target.value)}
        />
      </div>

      <div className="bk-actions">
        <button className="bk-btn-primary" disabled={!isValid} onClick={handleContinue}>
          Review Booking
        </button>
        <button className="bk-btn-secondary" onClick={prevStep}>
          Back
        </button>
      </div>
    </div>
  );
}
