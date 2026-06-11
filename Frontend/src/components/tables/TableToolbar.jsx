import { cn } from '@/lib/utils';

export function TableToolbar({ className, children }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      {children}
    </div>
  );
}

export default TableToolbar;
