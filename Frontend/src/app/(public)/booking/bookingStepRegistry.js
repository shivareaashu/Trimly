'use client';

/**
 * Booking Step Registry
 * 
 * Central registry mapping step keys to components + metadata.
 * The renderer resolves `STEP_REGISTRY[stepKey].component` at runtime.
 * 
 * To add a new step (e.g. Coupon, Membership, Consultation):
 *   1. Add entry to STEP_REGISTRY
 *   2. Add condition to buildFlow()
 *   3. Create StepXxx.jsx component
 * 
 * No page.jsx or store changes needed.
 */

import { lazy } from 'react';

// Eager imports for core steps (always in the flow)
import StepWelcome from './StepWelcome';
import StepService from './StepService';
import StepStylist from './StepStylist';
import StepDate from './StepDate';
import StepTime from './StepTime';
import StepDetails from './StepDetails';
import StepReview from './StepReview';
import StepSuccess from './StepSuccess';

// Lazy imports for conditional steps (only loaded when needed)
const StepBranch = lazy(() => import('./StepBranch'));
const StepPayment = lazy(() => import('./StepPayment'));

/**
 * Each registry entry defines:
 *  - component:       React component to render
 *  - label:           Human-readable label for progress bar
 *  - showInProgress:  Whether to show in the progress indicator
 *  - optional:        Whether this step can be skipped by buildFlow
 *  - disabled:        Whether this step is scaffolded but not yet active
 */
export const STEP_REGISTRY = {
  welcome:  { component: StepWelcome,  label: 'Welcome',  showInProgress: false },
  service:  { component: StepService,  label: 'Service',  showInProgress: true  },
  branch:   { component: StepBranch,   label: 'Branch',   showInProgress: true, optional: true },
  stylist:  { component: StepStylist,  label: 'Stylist',  showInProgress: true  },
  date:     { component: StepDate,     label: 'Date',     showInProgress: true  },
  time:     { component: StepTime,     label: 'Time',     showInProgress: true  },
  details:  { component: StepDetails,  label: 'Details',  showInProgress: true  },
  review:   { component: StepReview,   label: 'Review',   showInProgress: true  },
  payment:  { component: StepPayment,  label: 'Payment',  showInProgress: true, disabled: true },
  success:  { component: StepSuccess,  label: 'Done',     showInProgress: false },
};

/**
 * Build the active booking flow based on tenant configuration.
 * 
 * @param {Object|null} tenantConfig - Config returned from GET /api/public/bookings/config
 * @returns {string[]} Ordered array of step keys
 */
export function buildFlow(tenantConfig) {
  const flow = ['welcome', 'service'];

  // Inject branch step if tenant has multiple branches
  const branchCount = tenantConfig?.branches?.length ?? 0;
  if (branchCount > 1) {
    flow.push('branch');
  }

  flow.push('stylist', 'date', 'time', 'details', 'review');

  // Future: inject payment step when online payment is enabled
  // if (tenantConfig?.onlinePaymentEnabled) {
  //   flow.push('payment');
  // }

  flow.push('success');
  return flow;
}

/**
 * Get the progress-bar-visible steps from a flow.
 * Filters out welcome, success, and any steps not marked showInProgress.
 * 
 * @param {string[]} flow
 * @returns {{ key: string, label: string }[]}
 */
export function getProgressSteps(flow) {
  return flow
    .filter((key) => STEP_REGISTRY[key]?.showInProgress)
    .map((key) => ({ key, label: STEP_REGISTRY[key].label }));
}

export default STEP_REGISTRY;
