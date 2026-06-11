'use client';

import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-secondary text-secondary-foreground',
  gold: 'bg-primary/15 text-primary border border-primary/20',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
};

export function Badge({ variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
