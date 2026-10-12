import React from 'react';

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  helperText,
  errorMessage,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 tracking-tight"
        >
          {label}{' '}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      {children}

      {errorMessage ? (
        <p className="text-[11px] font-medium text-rose-600 mt-1">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField;
