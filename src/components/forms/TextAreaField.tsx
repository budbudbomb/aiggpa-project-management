import React, { forwardRef } from 'react';
import { FormField } from './FormField';

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerClassName?: string;
}

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    {
      id,
      label,
      required,
      helperText,
      errorMessage,
      className = '',
      containerClassName = '',
      rows = 3,
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

    const textareaNode = (
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y ${
          errorMessage
            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-slate-200 hover:border-slate-300 focus:ring-blue-600/20 focus:border-blue-600'
        } ${className}`}
        {...props}
      />
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
          {textareaNode}
        </FormField>
      );
    }

    return textareaNode;
  }
);

TextAreaField.displayName = 'TextAreaField';
export default TextAreaField;
