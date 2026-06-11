'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';

export function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  return (
    <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="h-9 w-9 p-0" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm" className="h-9 w-9 p-0" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
