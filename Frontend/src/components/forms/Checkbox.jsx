'use client';

import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }) {
  return (
    <input
      type="checkbox"
      className={cn('h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30', className)}
      {...props}
    />
  );
}

export default Checkbox;
