'use client';

import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[1.5rem] border border-border/80 bg-card/95 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-border/60 px-5 py-4 sm:px-6', className)} {...props} />;
}

export function CardBody({ className, ...props }) {
  return <div className={cn('px-5 py-5 sm:px-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('border-t border-border/60 px-5 py-4 sm:px-6', className)} {...props} />;
}

export default Card;
