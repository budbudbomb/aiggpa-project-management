import React from 'react';

export interface InputBlockProps {
  id?: string;
  label?: string;
  required?: boolean;
  errorMessage?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const InputBlock: React.FC<InputBlockProps> = ({
  id,
  label,
  required = false,
  errorMessage,
  helperText,
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          {label}{' '}
          {required && (
            <span className="text-rose-500 font-medium ml-0.5">*</span>
          )}
        </label>
      )}

      {children}

      {errorMessage ? (
        <span className="text-xs text-rose-500 font-medium animate-in fade-in-50">
          {errorMessage}
        </span>
      ) : helperText ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
