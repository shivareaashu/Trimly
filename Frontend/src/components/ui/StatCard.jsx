'use client';

import { Card, CardBody } from './Card';
import { cn } from '../../lib/utils';

export function StatCard({ label, value, hint, icon: Icon, className, tone = 'default' }) {
  const toneStyles = {
    default: 'text-primary',
    success: 'text-emerald-400',
    danger: 'text-rose-400',
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardBody className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-display font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('rounded-2xl border border-border bg-white/5 p-3', toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

export default StatCard;
