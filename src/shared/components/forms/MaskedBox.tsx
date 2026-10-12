import React, { forwardRef } from 'react';
import { InputBlock } from './InputBlock';

export interface MaskedBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
  maskPlaceholder?: string;
}

export const MaskedBox = forwardRef<HTMLInputElement, MaskedBoxProps>(
  (
    {
      id,
      label,
      required,
      errorMessage,
      helperText,
      maskPlaceholder = 'XXXX-XXXX-XXXX',
      className = '',
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
        <input
          id={inputId}
          ref={ref}
          placeholder={maskPlaceholder}
          className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono transition-colors duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
            errorMessage
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-primary dark:focus:border-primary focus:ring-primary/20 shadow-xs'
          } ${className}`}
          {...props}
        />
      </InputBlock>
    );
  }
);

MaskedBox.displayName = 'MaskedBox';
