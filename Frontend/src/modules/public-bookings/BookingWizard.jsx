'use client';

import { useState } from 'react';
import { useBookingStore } from './store/bookingStore';
import { bookingApi } from './services/bookingApi';
import { useTranslation } from '../../hooks/useTranslation';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Globe } from 'lucide-react';

// Import all step components
import ServiceStep from './steps/ServiceStep';
import StaffStep from './steps/StaffStep';
import DateSlotStep from './steps/DateSlotStep';
import DetailsStep from './steps/DetailsStep';
import ConfirmationStep from './steps/ConfirmationStep';

// Component mapping registry
const STEP_COMPONENTS = {
  ServiceStep,
  StaffStep,
  DateSlotStep,
  DetailsStep,
  ConfirmationStep,
};

export default function BookingWizard({ steps = [] }) {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Store select getters & actions
  const service = useBookingStore((state) => state.service);
  const staff = useBookingStore((state) => state.staff);
  const date = useBookingStore((state) => state.date);
  const slot = useBookingStore((state) => state.slot);
  const customer = useBookingStore((state) => state.customer);
  const notes = useBookingStore((state) => state.notes);
  const botField = useBookingStore((state) => state.botField);
  const holdToken = useBookingStore((state) => state.holdToken);
  
  const setBookingResult = useBookingStore((state) => state.setBookingResult);
  const resetStore = useBookingStore((state) => state.resetStore);

  const activeStep = steps[currentStepIndex];

  // Helper validation to see if the current step is completed
  const isStepValid = () => {
    if (!activeStep) return false;
    switch (activeStep.id) {
      case 'service':
        return !!service;
      case 'staff':
        return !!staff;
      case 'date_slot':
        return !!date && !!slot;
      case 'details':
        return (
          customer.firstName.trim() &&
          customer.lastName.trim() &&
          customer.phone.trim().length >= 5
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid() && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setError('');
    }
  };

  const handleStartOver = () => {
    resetStore();
    setCurrentStepIndex(0);
    setError('');
  };

  // Perform transaction-level write booking submit to the backend
  const handleSubmitBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        serviceId: service.id,
        staffId: staff.id,
        startTime: slot.startTime,
        holdToken: holdToken || undefined,
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: customer.email?.trim() || undefined,
          phone: customer.phone.trim(),
        },
        notes: notes.trim() || undefined,
        botField: botField ? botField : undefined,
      };

      const response = await bookingApi.createBooking(payload);
      
      setBookingResult(response.booking);
      
      // Advance to the confirmation step
      const confirmationIdx = steps.findIndex((s) => s.id === 'confirmation');
      if (confirmationIdx !== -1) {
        setCurrentStepIndex(confirmationIdx);
      } else {
        setCurrentStepIndex(steps.length - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeStep) return null;

  // Resolve dynamic step component view
  const StepComponent = STEP_COMPONENTS[activeStep.componentName];
  const isFinalInputStep = activeStep.id === 'details';
  const isConfirmStep = activeStep.id === 'confirmation';

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d0c12]/80 p-6 shadow-2xl backdrop-blur-xl md:p-8 space-y-6">
      {/* Header Bar: Actions & Languages */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            {t('booking.online_booking')}
          </span>
        </div>

        {/* Dynamic Locale Selector */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-neutral-300">
          <Globe className="h-3.5 w-3.5 text-amber-400" />
          <select
            value={currentLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent font-semibold outline-none text-white cursor-pointer"
          >
            <option value="en" className="bg-[#0d0c12] text-white">English</option>
            <option value="hi" className="bg-[#0d0c12] text-white">हिन्दी</option>
            <option value="mr" className="bg-[#0d0c12] text-white">मराठी</option>
            <option value="gu" className="bg-[#0d0c12] text-white">ગુજરાતી</option>
            <option value="kn" className="bg-[#0d0c12] text-white">ಕನ್ನಡ</option>
            <option value="ta" className="bg-[#0d0c12] text-white">தமிழ்</option>
            <option value="te" className="bg-[#0d0c12] text-white">తెలుగు</option>
            <option value="ml" className="bg-[#0d0c12] text-white">മലയാളം</option>
          </select>
        </div>
      </div>

      {/* Step validation error */}
      {error && (
        <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 px-4 py-3.5 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Main Dynamic View Area */}
      <div className="min-h-[250px]">
        {StepComponent ? (
          <StepComponent
            onNext={handleNext}
            onStartOver={handleStartOver}
          />
        ) : (
          <div className="text-center py-10 text-neutral-500">
            Step Component '{activeStep.componentName}' not found.
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      {!isConfirmStep && (
        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4">
          {/* Back Action */}
          {currentStepIndex > 0 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('booking.back')}
            </button>
          ) : (
            <div />
          )}

          {/* Forward / Final Submission Action */}
          {isFinalInputStep ? (
            <button
              onClick={handleSubmitBooking}
              disabled={!isStepValid() || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/10 hover:from-amber-300 hover:to-amber-500 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('booking.reserving')}
                </>
              ) : (
                <>
                  {t('booking.confirm')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black px-5 py-3 text-sm font-bold transition disabled:opacity-40"
            >
              {t('booking.next')}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
