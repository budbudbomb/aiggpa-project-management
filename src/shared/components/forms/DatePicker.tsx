import { Calendar } from 'primereact/calendar';
import { InputBlock } from './InputBlock';

export interface DatePickerProps {
  id?: string;
  label?: string;
  value: Date | Date[] | null;
  onChange: (value: Date | Date[] | null) => void;
  placeholder?: string;
  errorMessage?: string;
  helperText?: string;
  dateFormat?: string;
  disabled?: boolean;
  required?: boolean;
  showIcon?: boolean;
  selectionMode?: 'single' | 'multiple' | 'range';
  className?: string;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Select date',
  errorMessage,
  helperText,
  dateFormat = 'dd/mm/yy',
  disabled = false,
  required = false,
  showIcon = true,
  selectionMode = 'single',
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
      <Calendar
        id={inputId}
        value={value}
        onChange={e => onChange(e.value as Date | Date[] | null)}
        placeholder={placeholder}
        dateFormat={dateFormat}
        disabled={disabled}
        showIcon={showIcon}
        selectionMode={selectionMode}
        className={`w-full ${errorMessage ? 'border-rose-500!' : ''}`}
        panelClassName={panelClassName}
        panelStyle={panelStyle}
      />
    </InputBlock>
  );
};
