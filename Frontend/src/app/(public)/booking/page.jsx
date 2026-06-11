'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useBookingStore } from './useBookingStore';
import { STEP_REGISTRY, getProgressSteps } from './bookingStepRegistry';
import { resolveBookingTheme, themeToCSS } from './bookingTheme';
import './booking.css';

/**
 * Progress bar — renders only the steps marked showInProgress in the registry.
 * Hidden on welcome (first) and success (last).
 */
function ProgressBar({ flow, stepIndex }) {
  const currentKey = flow[stepIndex];
  const currentEntry = STEP_REGISTRY[currentKey];

  // Hide on steps not in progress bar (welcome, success)
  if (!currentEntry?.showInProgress) return null;

  const progressSteps = getProgressSteps(flow);
  const currentProgressIdx = progressSteps.findIndex((s) => s.key === currentKey);
  const percent = progressSteps.length > 0
    ? ((currentProgressIdx + 1) / progressSteps.length) * 100
    : 0;

  return (
    <div className="bk-progress">
      <div className="bk-progress-track">
        <div className="bk-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="bk-progress-steps">
        {progressSteps.map((s, i) => {
          let cls = '';
          if (i < currentProgressIdx) cls = 'completed';
          else if (i === currentProgressIdx) cls = 'active';
          return <span key={s.key} className={cls}>{s.label}</span>;
        })}
      </div>
    </div>
  );
}

/**
 * Main booking page — wraps BookPageInner in Suspense for useSearchParams SSG.
 */
export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="bk-container">
        <div className="bk-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="bk-loading"><div className="bk-spinner" /></div>
        </div>
      </div>
    }>
      <BookPageInner />
    </Suspense>
  );
}

function BookPageInner() {
  const searchParams = useSearchParams();
  const {
    stepIndex,
    flow,
    setTenantSlug,
    fetchConfig,
    tenantConfig,
    tenantSlug,
    error,
    clearError,
    trackEvent,
    captureAbandonment,
  } = useBookingStore();

  // Read tenant slug from URL on mount
  useEffect(() => {
    const slug = searchParams.get('salon') || searchParams.get('tenant') || searchParams.get('slug') || '';
    if (slug) {
      setTenantSlug(slug);
      fetchConfig();
    }
  }, [searchParams]);

  // Track booking_started when user moves past welcome
  useEffect(() => {
    if (stepIndex === 1) {
      trackEvent('booking_started');
    }
  }, [stepIndex]);

  // Capture abandonment on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { stepIndex: idx, flow: f } = useBookingStore.getState();
      const currentKey = f[idx];
      // Only capture if user has progressed past date step
      if (['details', 'review'].includes(currentKey)) {
        captureAbandonment();
        trackEvent('booking_abandoned', { step: currentKey });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Resolve current step component from registry
  const currentKey = flow[stepIndex] || 'welcome';
  const stepEntry = STEP_REGISTRY[currentKey];
  const StepComponent = stepEntry?.component;

  // Resolve dynamic theme from tenant config
  const theme = resolveBookingTheme(tenantConfig);
  const themeVars = themeToCSS(theme);

  // ── No slug: show slug entry form ──
  if (!tenantSlug && stepIndex === 0) {
    return (
      <div className="bk-container">
        <div className="bk-content" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="bk-welcome-logo" style={{ fontSize: 28 }}>✂️</div>
          <h1 className="bk-title">Book an Appointment</h1>
          <p className="bk-subtitle" style={{ maxWidth: 300 }}>
            Enter the salon code to get started
          </p>
          {error && (
            <div className="bk-error" style={{ maxWidth: 320, width: '100%' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <SlugEntry />
        </div>
      </div>
    );
  }

  // ── Slug set but config loading ──
  if (tenantSlug && !tenantConfig && stepIndex === 0) {
    return (
      <div className="bk-container">
        <div className="bk-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
          {error ? (
            <>
              <div className="bk-error" style={{ maxWidth: 360, width: '100%' }}>
                <AlertCircle size={14} />
                {error}
              </div>
              <button
                className="bk-btn-secondary"
                onClick={() => { clearError(); setTenantSlug(''); }}
                style={{ maxWidth: 200 }}
              >
                Try Again
              </button>
            </>
          ) : (
            <div className="bk-loading"><div className="bk-spinner" /></div>
          )}
        </div>
      </div>
    );
  }

  // ── Main flow ──
  return (
    <div className="bk-container" style={themeVars}>
      <ProgressBar flow={flow} stepIndex={stepIndex} />
      <div className="bk-content">
        {error && currentKey !== 'review' && currentKey !== 'success' && (
          <div className="bk-error">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        {StepComponent ? <StepComponent /> : <div className="bk-empty">Unknown step: {currentKey}</div>}
      </div>
    </div>
  );
}

/* ─── Slug Entry Mini-form ─── */
function SlugEntry() {
  const { setTenantSlug, fetchConfig } = useBookingStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const slug = fd.get('slug')?.toString().trim();
    if (slug) {
      setTenantSlug(slug);
      fetchConfig();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        name="slug"
        className="bk-input"
        placeholder="e.g. lumiere-atelier"
        autoFocus
        style={{ textAlign: 'center' }}
      />
      <button type="submit" className="bk-btn-primary">
        Continue
      </button>
    </form>
  );
}
