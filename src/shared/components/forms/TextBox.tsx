import React, { forwardRef } from 'react';
import { InputBlock } from './InputBlock';
import { X } from 'lucide-react';

export interface TextBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(
  (
    {
      id,
      label,
      required,
      errorMessage,
      helperText,
      leftIcon,
      rightIcon,
      onClear,
      className = '',
      value,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <InputBlock
        id={inputId}
        label={label}
        required={required}
        errorMessage={errorMessage}
        helperText={helperText}
      >
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            value={value}
            className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon || (onClear && value) ? 'pr-10' : ''} ${
              errorMessage
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs focus:border-primary focus:ring-primary/15'
            } ${className}`}
            {...props}
          />

          {onClear && value ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {rightIcon}
            </div>
          ) : null}
        </div>
      </InputBlock>
    );
  }
);

TextBox.displayName = 'TextBox';
