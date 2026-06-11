'use client';

import { Select } from '@/components/forms/Select.jsx';

export function TableFilters({ filters = [], values = {}, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filters.map((filter) => {
        const key = typeof filter === 'string' ? filter.toLowerCase().replaceAll(' ', '_') : filter.key;
        const label = typeof filter === 'string' ? filter : filter.label;
        const options = typeof filter === 'string' ? [] : filter.options || [];

        return (
          <Select key={key} value={values[key] || ''} onChange={(event) => onChange?.(key, event.target.value)}>
            <option value="">{label}</option>
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </Select>
        );
      })}
    </div>
  );
}

export default TableFilters;
