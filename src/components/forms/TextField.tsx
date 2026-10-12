import React, { forwardRef } from 'react';
import { FormField } from './FormField';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      required,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId =
      id ||
      (label
        ? `field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
        : undefined);

    const inputNode = (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${
            errorMessage
              ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
              : 'border-slate-200 hover:border-slate-300 focus:ring-blue-600/20 focus:border-blue-600'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
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
          {inputNode}
        </FormField>
      );
    }

    return inputNode;
  }
);

TextField.displayName = 'TextField';
export default TextField;
