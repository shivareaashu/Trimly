/**
 * Registry of booking wizard workflow steps.
 * Steps can be required or optional, and can depend on tenant module subscription flags.
 */
export const bookingWorkflow = [
  {
    id: 'service',
    componentName: 'ServiceStep',
    required: true,
  },
  {
    id: 'staff',
    componentName: 'StaffStep',
    required: true,
  },
  {
    id: 'date_slot',
    componentName: 'DateSlotStep',
    required: true,
  },
  // Placeholders for future features showing modular injection scalability
  {
    id: 'coupon',
    componentName: 'CouponStep',
    required: false,
    module: 'coupons',
  },
  {
    id: 'membership',
    componentName: 'MembershipStep',
    required: false,
    module: 'memberships',
  },
  {
    id: 'payment',
    componentName: 'PaymentStep',
    required: false,
    module: 'payments',
  },
  {
    id: 'details',
    componentName: 'DetailsStep',
    required: true,
  },
  {
    id: 'confirmation',
    componentName: 'ConfirmationStep',
    required: true,
  },
];

/**
 * Filter steps dynamically according to the tenant's subscribed modules.
 * If a step is optional and depends on a module, it will only render if the module is enabled.
 * 
 * @param {Array<string>} activeModules - List of module codes active for the tenant (e.g., ['bookings'])
 * @returns {Array<Object>} Filtered workflow steps
 */
export function getFilteredWorkflow(activeModules = []) {
  return bookingWorkflow.filter(step => {
    // If it's a required core step, include it
    if (step.required) return true;

    // If it depends on a module, verify if that module is enabled for the tenant
    if (step.module) {
      return activeModules.includes(step.module);
    }

    return false;
  });
}
