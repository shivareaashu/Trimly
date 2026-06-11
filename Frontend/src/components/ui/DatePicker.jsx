'use client';

import { cn } from '../../lib/utils';

export function DatePicker({ className, ...props }) {
  return (
    <input
      type="date"
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20',
        className
      )}
      {...props}
    />
  );
}

export default DatePicker;
