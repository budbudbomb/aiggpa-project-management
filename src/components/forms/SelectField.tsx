import React from 'react';
import { FormField } from './FormField';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange'
> {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  containerClassName?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  required,
  helperText,
  errorMessage,
  className = '',
  containerClassName = '',
  disabled,
  ...props
}) => {
  const inputId =
    id ||
    (label
      ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : undefined);

  const selectNode = (
    <select
      id={inputId}
      value={value !== undefined ? String(value) : ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      required={required}
      className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
        errorMessage
          ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
          : 'border-slate-200 hover:border-slate-300 focus:ring-blue-600/20 focus:border-blue-600'
      } ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (label || helperText || errorMessage) {
    return (
      <FormField
        id={inputId}
        label={label}
        required={required}
        helperText={helperText}
        errorMessage={errorMessage}
        className={containerClassName}
      >
        {selectNode}
      </FormField>
    );
  }

  return selectNode;
};

export default SelectField;
