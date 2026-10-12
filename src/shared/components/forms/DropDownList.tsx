import React from 'react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { type SelectOption } from 'types/common';

export interface DropDownListProps {
  id?: string;
  label?: string;
  options: SelectOption[];
  value: string | number | null | undefined;
  onChange: (value: string | number | null | undefined) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  showClear?: boolean;
  className?: string;
  required?: boolean;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
}

export const DropDownList: React.FC<DropDownListProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  helperText,
  disabled = false,
  filter = true,
  filterPlaceholder = 'Search...',
  showClear = false,
  className = '',
  required = false,
  panelClassName = '',
  panelStyle,
}) => {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const defaultItemTemplate = (option: SelectOption) => {
    if (!option) return null;
    return (
      <div className="whitespace-normal wrap-break-word leading-relaxed text-xs py-0.5 max-w-full text-slate-800 dark:text-slate-200">
        {option.label}
      </div>
    );
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <Dropdown
        id={inputId}
        value={value}
        options={options}
        onChange={(e: DropdownChangeEvent) => onChange(e.value)}
        optionLabel="label"
        optionValue="value"
        placeholder={placeholder}
        filter={filter}
        filterBy="label"
        filterPlaceholder={filterPlaceholder}
        filterMatchMode="contains"
        showClear={showClear}
        disabled={disabled}
        itemTemplate={defaultItemTemplate}
        className={`w-full ${error ? 'border-rose-500!' : ''}`}
        panelClassName={`z-[99999] shadow-xl ${panelClassName}`}
        panelStyle={{ maxWidth: 'min(92vw, 450px)', ...panelStyle }}
      />

      {error ? (
        <span className="text-xs text-rose-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
