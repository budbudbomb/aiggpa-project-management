import React from 'react';

export interface CheckboxFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label: React.ReactNode;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  errorMessage?: string;
  className?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  errorMessage,
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || `check-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className={`flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition cursor-pointer"
          {...props}
        />
        <div className="text-xs">
          <span className="font-semibold text-slate-700">{label}</span>
          {description && (
            <p className="text-slate-500 text-[11px] mt-0.5 font-normal">
              {description}
            </p>
          )}
        </div>
      </label>
      {errorMessage && (
        <p className="text-[11px] font-medium text-rose-600 pl-6">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default CheckboxField;
