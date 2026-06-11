'use client';

export function LoadingState({ label = 'Loading Trimly...' }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-[1.5rem] border border-border bg-card/80">
      <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

export default LoadingState;
