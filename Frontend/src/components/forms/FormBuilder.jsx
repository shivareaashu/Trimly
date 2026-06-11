'use client';

import { Checkbox } from './Checkbox.jsx';
import { DatePicker } from './DatePicker.jsx';
import { Input } from './Input.jsx';
import { Select } from './Select.jsx';
import { TextArea } from './TextArea.jsx';

const FIELD_COMPONENTS = {
  checkbox: Checkbox,
  date: DatePicker,
  input: Input,
  select: Select,
  textarea: TextArea,
};

export function FormBuilder({ fields = [], values = {}, onChange }) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => {
        const Component = FIELD_COMPONENTS[field.type || 'input'] || Input;
        const value = field.type === 'checkbox' ? undefined : values[field.name] || '';

        return (
          <label className="grid gap-2 text-sm font-medium text-foreground" key={field.name}>
            {field.label}
            <Component
              {...field.props}
              checked={field.type === 'checkbox' ? Boolean(values[field.name]) : undefined}
              name={field.name}
              value={value}
              onChange={(event) => {
                const nextValue = field.type === 'checkbox' ? event.target.checked : event.target.value;
                onChange?.(field.name, nextValue);
              }}
            >
              {field.options?.map((option) => (
                <option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </Component>
          </label>
        );
      })}
    </div>
  );
}

export default FormBuilder;
