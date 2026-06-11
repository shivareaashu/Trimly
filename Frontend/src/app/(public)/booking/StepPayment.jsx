'use client';

import { CreditCard } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

/**
 * Payment step — scaffolded for future use.
 * Currently disabled in the registry (disabled: true).
 * 
 * When enabled, this step will integrate with:
 *  - Razorpay checkout
 *  - Cashfree session
 *  - UPI deep links
 *  - Pay-at-salon option
 */
export default function StepPayment() {
  const { nextStep, prevStep } = useBookingStore();

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <CreditCard size={12} />
        Payment
      </div>
      <h2 className="bk-title">How would you like to pay?</h2>
      <p className="bk-subtitle">Choose your preferred payment method</p>

      <div className="bk-card-grid">
        <div className="bk-card selected">
          <div className="bk-card-icon">💳</div>
          <div className="bk-card-name">Pay at Salon</div>
          <div className="bk-card-meta">Pay when you arrive</div>
        </div>
      </div>

      <div className="bk-actions">
        <button className="bk-btn-primary" onClick={nextStep}>
          Continue
        </button>
        <button className="bk-btn-secondary" onClick={prevStep}>
          Back
        </button>
      </div>
    </div>
  );
}
