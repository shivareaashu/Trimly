'use client';

import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary text-primary-foreground shadow-lg shadow-black/20 hover:brightness-110',
  secondary: 'border border-border bg-card text-foreground hover:bg-white/5',
  ghost: 'text-foreground hover:bg-white/5',
  danger: 'bg-destructive text-destructive-foreground hover:brightness-110',
};

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
};

export function Button({
  asChild = false,
  variant = 'primary',
  size = 'md',
  className,
  children,
  type,
  ...props
}) {
  const Comp = asChild ? 'span' : 'button';
  const buttonType = type || 'button';

  return (
    <Comp
      type={asChild ? undefined : buttonType}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export default Button;
