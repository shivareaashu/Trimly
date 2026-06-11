'use client';

import { cn } from '../../lib/utils';
import { Card } from './Card';

export function DataTable({ columns = [], rows = [], className, emptyMessage = 'No records found.' }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/70">
          <thead className="bg-white/3">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-white/3 transition">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4 text-sm text-foreground">
                      {typeof column.render === 'function' ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default DataTable;
