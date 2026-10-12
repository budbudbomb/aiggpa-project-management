import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  maxWidth?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  maxWidth,
}) => {
  const widthClass = maxWidth
    ? sizeMap[maxWidth] || maxWidth
    : sizeMap[size] || 'max-w-lg';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Centered Flex Container */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Dialog Card */}
        <div
          className={`relative z-10 w-full ${widthClass} transform rounded-xl bg-white dark:bg-slate-900 text-left shadow-xl shadow-slate-900/10 transition-all duration-200 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in fade-in-0 zoom-in-95`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h2
                id="modal-headline"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4.5 h-4.5" />}
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mr-2 -mt-2 p-1.5 rounded-lg"
              title="Close (Esc)"
            />
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {children}
          </div>

          {/* Sticky Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-b-2xl shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
