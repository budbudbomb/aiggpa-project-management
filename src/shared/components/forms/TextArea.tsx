import React, { forwardRef } from 'react';
import { InputBlock } from './InputBlock';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      required,
      errorMessage,
      helperText,
      className = '',
      rows = 4,
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
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 resize-y ${
            errorMessage
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs focus:border-primary focus:ring-primary/15 transition-all'
          } ${className}`}
          {...props}
        />
      </InputBlock>
    );
  }
);

TextArea.displayName = 'TextArea';
