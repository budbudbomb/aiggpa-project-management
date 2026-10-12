import React from 'react';
import {
  MultiSelect,
  type MultiSelectChangeEvent,
} from 'primereact/multiselect';
import { InputBlock } from './InputBlock';
import { type SelectOption } from 'types/common';

export interface MultiSelectListProps {
  id?: string;
  label?: string;
  options: SelectOption[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  errorMessage?: string;
  helperText?: string;
  disabled?: boolean;
  filter?: boolean;
  required?: boolean;
  className?: string;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
}

export const MultiSelectList: React.FC<MultiSelectListProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options',
  errorMessage,
  helperText,
  disabled = false,
  filter = true,
  required = false,
  className = '',
  panelClassName = '',
  panelStyle,
}) => {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <InputBlock
      id={inputId}
      label={label}
      required={required}
      errorMessage={errorMessage}
      helperText={helperText}
      className={className}
    >
      <MultiSelect
        id={inputId}
        value={value}
        options={options}
        onChange={(e: MultiSelectChangeEvent) => onChange(e.value)}
        optionLabel="label"
        optionValue="value"
        placeholder={placeholder}
        filter={filter}
        disabled={disabled}
        display="chip"
        appendTo="self"
        className={`w-full ${errorMessage ? 'border-rose-500!' : ''}`}
        panelClassName={panelClassName}
        panelStyle={panelStyle}
      />
    </InputBlock>
  );
};
