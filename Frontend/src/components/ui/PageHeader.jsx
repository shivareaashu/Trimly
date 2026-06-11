'use client';

import { cn } from '../../lib/utils';
import { Button } from './Button';

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/80">{eyebrow}</p>
        ) : null}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {children}
        {actionLabel ? (
          <Button variant="primary" size="lg" onClick={onAction}>
            {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null}
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default PageHeader;
