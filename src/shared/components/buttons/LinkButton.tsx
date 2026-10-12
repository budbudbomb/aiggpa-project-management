import React from 'react';

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  href = '#',
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </a>
  );
};
