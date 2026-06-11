'use client';

import { X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../../lib/utils';

export function Drawer({ open, title, onClose, children, size = 'md', side = 'right' }) {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full',
  };
  const isRight = side === 'right';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          'absolute top-0 h-full w-full',
          sizeClasses[size] || sizeClasses.md,
          isRight ? 'right-0' : 'left-0'
        )}
      >
        <Card className={cn('h-full rounded-none border-y-0', isRight ? 'border-r-0' : 'border-l-0')}>
          <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[calc(100%-4rem)] overflow-y-auto px-5 py-5">{children}</div>
        </Card>
      </div>
    </div>
  );
}

export default Drawer;
