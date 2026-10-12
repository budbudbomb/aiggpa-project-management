import React from 'react';
import { Radio } from './Radio';
import { InputBlock } from './InputBlock';
import { type SelectOption } from 'types/common';

export interface RadioListProps {
  id?: string;
  name: string;
  label?: string;
  options: SelectOption[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioList: React.FC<RadioListProps> = ({
  id,
  name,
  label,
  options,
  value,
  onChange,
  errorMessage,
  helperText,
  disabled = false,
  required = false,
  orientation = 'vertical',
  className = '',
}) => {
  return (
    <InputBlock
      id={id}
      label={label}
      required={required}
      errorMessage={errorMessage}
      helperText={helperText}
      className={className}
    >
      <div
        className={`flex ${orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'}`}
      >
        {options.map(opt => (
          <Radio
            key={String(opt.value)}
            name={name}
            label={opt.label}
            value={opt.value}
            checked={value === opt.value}
            disabled={disabled || opt.disabled}
            onChange={val => onChange(val)}
          />
        ))}
      </div>
    </InputBlock>
  );
};
