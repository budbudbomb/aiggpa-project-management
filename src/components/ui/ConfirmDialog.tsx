import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppDialog } from './AppDialog';
import { AppButton } from './AppButton';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>{title}</span>
        </div>
      }
      maxWidth="sm"
      footer={
        <>
          <AppButton
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </AppButton>
          <AppButton
            variant={confirmVariant === 'warning' ? 'primary' : confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </AppButton>
        </>
      }
    >
      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        {message}
      </div>
    </AppDialog>
  );
};

export default ConfirmDialog;
