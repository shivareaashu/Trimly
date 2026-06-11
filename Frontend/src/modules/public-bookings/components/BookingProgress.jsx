'use client';

import { Check } from 'lucide-react';
import { Card } from '../../../components/ui';

/**
 * Renders the checkout progress indicator header dynamically.
 * Adaptable to dynamic workflow injections.
 */
export default function BookingProgress({ steps = [], currentStepIndex = 0, labels = {} }) {
  const defaultLabels = {
    service: 'Service',
    staff: 'Stylist',
    date_slot: 'Schedule',
    coupon: 'Coupon',
    membership: 'Member Plan',
    payment: 'Payment',
    details: 'Details',
    confirmation: 'Done',
  };
  const stepLabels = { ...defaultLabels, ...labels };

  return (
    <div className="w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <Card className="mx-auto max-w-6xl rounded-none border-x-0 border-t-0 bg-transparent shadow-none">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle node */}
              <div className="flex flex-col items-center relative group min-w-[64px]">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                      ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                
                {/* Responsive Label */}
                <span
                  className={`absolute top-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stepLabels[step.id] || step.id}
                </span>
              </div>

              {/* Progress Line Connector */}
              {!isLast && (
                <div
                  className={`mx-2 h-[2px] flex-1 rounded transition-colors duration-300 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
          </div>
          <div className="h-6" />
        </div>
      </Card>
    </div>
  );
}
