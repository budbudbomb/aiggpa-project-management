import React from 'react';

export interface RadioProps {
  id?: string;
  name?: string;
  label: string;
  value: string | number;
  checked: boolean;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  description?: string;
}

export const Radio: React.FC<RadioProps> = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
  disabled = false,
  description,
}) => {
  const radioId =
    id || `radio-${name}-${String(value).toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label
      htmlFor={radioId}
      className={`inline-flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="relative flex items-center mt-0.5">
        <input
          id={radioId}
          type="radio"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded-full border transition-all duration-150 flex items-center justify-center ${
            checked
              ? 'border-primary bg-white dark:bg-slate-900 shadow-xs'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {checked && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};
