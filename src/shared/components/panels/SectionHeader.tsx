import React from 'react';
import { Plus } from 'lucide-react';
import { Button, type ButtonVariant } from 'shared/components/buttons';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  // Built-in Action Button props:
  buttonText?: string;
  onButtonClick?: () => void;
  buttonIcon?: React.ReactNode;
  buttonVariant?: ButtonVariant;
  buttonDisabled?: boolean;
  // Custom Action / Children fallback:
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconBg = 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  buttonText,
  onButtonClick,
  buttonIcon,
  buttonVariant = 'primary',
  buttonDisabled = false,
  action,
  children,
  className = '',
}) => {
  const resolvedButtonIcon =
    buttonIcon !== undefined ? buttonIcon : <Plus className="w-4 h-4" />;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(
                  icon as React.ReactElement<{ className?: string }>,
                  {
                    className: `w-5 h-5 ${(icon.props as { className?: string })?.className || ''}`,
                  }
                )
              : icon}
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed wrap-break-word">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {(buttonText || action || children) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {buttonText && onButtonClick && (
            <Button
              variant={buttonVariant}
              size="md"
              leftIcon={resolvedButtonIcon || undefined}
              onClick={onButtonClick}
              disabled={buttonDisabled}
            >
              {buttonText}
            </Button>
          )}
          {action}
          {children}
        </div>
      )}
    </div>
  );
};
