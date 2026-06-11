'use client';

import { cn } from '@/lib/utils';

export function TextArea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20',
        className
      )}
      {...props}
    />
  );
}

export default TextArea;
