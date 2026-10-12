import React from 'react';
import { Checkbox } from './Checkbox';
import { InputBlock } from './InputBlock';
import { type SelectOption } from 'types/common';

export interface CheckBoxListProps {
  id?: string;
  label?: string;
  options: SelectOption[];
  values: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const CheckBoxList: React.FC<CheckBoxListProps> = ({
  id,
  label,
  options,
  values,
  onChange,
  errorMessage,
  helperText,
  disabled = false,
  required = false,
  orientation = 'vertical',
  className = '',
}) => {
  const handleToggle = (val: string | number, checked: boolean) => {
    if (checked) {
      onChange([...values, val]);
    } else {
      onChange(values.filter(v => v !== val));
    }
  };

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
          <Checkbox
            key={String(opt.value)}
            label={opt.label}
            checked={values.includes(opt.value)}
            disabled={disabled || opt.disabled}
            onChange={checked => handleToggle(opt.value, checked)}
          />
        ))}
      </div>
    </InputBlock>
  );
};
