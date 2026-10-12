import React from 'react';
import { Grid } from './Grid';

export function ResponsiveGrid<T extends object = object>({
  renderMobileItem,
  ...gridProps
}: Controls.ResponsiveGridProps<T>) {
  const columns = gridProps.columns || [];

  const defaultRenderMobileItem = (item: T, index: number) => {
    return (
      <div className="shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pb-3 px-3 pt-2">
        <div className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex gap-2 text-sm">
          {columns[0]?.cell && (
            <span>{columns[0].cell(item, { rowIndex: index })}</span>
          )}
          {columns[1]?.cell && (
            <span className="leading-relaxed">
              {columns[1].cell(item, { rowIndex: index })}
            </span>
          )}
        </div>
        <div className="mt-2 w-full">
          {columns[2]?.cell && columns[2].cell(item, { rowIndex: index })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop: full Grid */}
      <div className="hidden md:block">
        <Grid {...gridProps} />
      </div>

      {/* Mobile: custom card layout */}
      <div className="md:hidden flex flex-col gap-2 px-1 py-2">
        {gridProps.data?.map((item, index) => (
          <React.Fragment
            key={
              gridProps.dataKey
                ? String(item[gridProps.dataKey as keyof T])
                : index
            }
          >
            {renderMobileItem
              ? renderMobileItem(item, index)
              : defaultRenderMobileItem(item, index)}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
