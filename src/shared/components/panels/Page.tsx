import React, { type ReactNode } from 'react';
import { PageHeader, type BreadcrumbItem } from './PageHeader';

export interface PageProps extends React.PropsWithChildren {
  header?: string;
  subHeader?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  icon?: ReactNode;
  hideDivider?: boolean;
  className?: string;
}

export const Page: React.FC<PageProps> = ({
  children,
  header,
  subHeader,
  breadcrumbs,
  actions,
  icon,
  hideDivider = true,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col w-full min-w-0 max-w-full ${
        header ? 'mt-1 sm:mt-3' : 'mt-0'
      } ${className}`}
    >
      {header && (
        <PageHeader
          title={header}
          subtitle={subHeader}
          breadcrumbs={breadcrumbs}
          actions={actions}
          icon={icon}
          hideDivider={hideDivider}
        />
      )}
      {children}
    </div>
  );
};
