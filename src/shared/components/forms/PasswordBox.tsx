import React, { useState, forwardRef } from 'react';
import { InputBlock } from './InputBlock';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordBoxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
  errorMessage?: string;
  helperText?: string;
}

export const PasswordBox = forwardRef<HTMLInputElement, PasswordBoxProps>(
  (
    { id, label, required, errorMessage, helperText, className = '', ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
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
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Lock className="w-4 h-4" />
          </div>

          <input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full pl-10 pr-10 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errorMessage
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-primary dark:focus:border-primary focus:ring-primary/20 shadow-xs'
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </InputBlock>
    );
  }
);

PasswordBox.displayName = 'PasswordBox';
