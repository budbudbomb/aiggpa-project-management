import { Calendar } from 'primereact/calendar';
import { InputBlock } from './InputBlock';

export interface TimePickerProps {
  id?: string;
  label?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  errorMessage?: string;
  helperText?: string;
  hourFormat?: '12' | '24';
  disabled?: boolean;
  required?: boolean;
  className?: string;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Select time',
  errorMessage,
  helperText,
  hourFormat = '12',
  disabled = false,
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
      <Calendar
        id={inputId}
        value={value}
        onChange={e => onChange(e.value as Date | null)}
        placeholder={placeholder}
        timeOnly
        hourFormat={hourFormat}
        disabled={disabled}
        showIcon
        className={`w-full ${errorMessage ? 'border-rose-500!' : ''}`}
        panelClassName={panelClassName}
        panelStyle={panelStyle}
      />
    </InputBlock>
  );
};
