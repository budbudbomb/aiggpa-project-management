import React from 'react';
import { AppButton } from '../ui/AppButton';

export interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
  extraActions?: React.ReactNode;
  className?: string;
}

const alignMap = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Save Changes',
  isSubmitting = false,
  submitDisabled = false,
  align = 'right',
  extraActions,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-3 pt-3 border-t border-slate-100 ${alignMap[align]} ${className}`}
    >
      {extraActions && <div className="mr-auto">{extraActions}</div>}

      {onCancel && (
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </AppButton>
      )}

      <AppButton
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        variant="primary"
        size="sm"
        isLoading={isSubmitting}
        disabled={submitDisabled || isSubmitting}
      >
        {submitLabel}
      </AppButton>
    </div>
  );
};

export default FormActions;
