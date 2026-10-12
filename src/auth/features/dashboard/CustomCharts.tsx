import React, { useState } from 'react';
import {
  ArrowDown,
  Milestone,
  Layers,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useThemeStore, PRIMARY_COLORS } from 'auth/store/themeStore';

// ==========================================
// 1. WATERFALL CHART (INCOME & EXPENDITURE)
// ==========================================
export interface WaterfallDataItem {
  label: string;
  value: number;
  type: 'inflow' | 'outflow' | 'total';
}

export interface WaterfallChartProps {
  data: WaterfallDataItem[];
  onElementClick?: (label: string) => void;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  onElementClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute Income, Expenditure, and Net Position only
  const incomeItem = data.find(
    d =>
      d.type === 'inflow' ||
      d.label.toLowerCase().includes('income') ||
      d.label.toLowerCase().includes('inflow') ||
      d.label.toLowerCase().includes('grant')
  );
  const expenseItem = data.find(
    d =>
      d.type === 'outflow' ||
      d.label.toLowerCase().includes('expenditure') ||
      d.label.toLowerCase().includes('expense')
  );

  const totalIncome = incomeItem?.value || 25500000;
  const totalExpense = expenseItem?.value || 45000000;
  const netPosition = totalIncome - totalExpense;

  const items = [
    {
      label: 'Total Income',
      value: totalIncome,
      start: 0,
      end: totalIncome,
      type: 'inflow' as const,
    },
    {
      label: 'Expenditures',
      value: totalExpense,
      start: totalIncome,
      end: totalIncome - totalExpense,
      type: 'outflow' as const,
    },
    {
      label: 'Net Position',
      value: netPosition,
      start: 0,
      end: netPosition,
      type: 'total' as const,
    },
  ];

  const formatCr = (val: number) => {
    const cr = val / 10000000;
    const sign = cr > 0 ? '+' : '';
    return `${sign}₹${cr.toFixed(2)} Cr`;
  };

  const formatCrPlain = (val: number) => {
    const cr = Math.abs(val) / 10000000;
    const sign = val < 0 ? '-₹' : '₹';
    return `${sign}${cr.toFixed(2)} Cr`;
  };

  const yMin = -30000000; // -3.00 Cr
  const yMax = 50000000; // 5.00 Cr
  const yTicks = [
    50000000, 40000000, 30000000, 20000000, 10000000, 0, -10000000, -20000000,
    -30000000,
  ];

  const svgWidth = 580;
  const svgHeight = 280;
  const margin = { top: 32, right: 25, bottom: 45, left: 75 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const scaleY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return margin.top + plotHeight * (1 - ratio);
  };

  const colWidth = 72;
  const colGap = (plotWidth - colWidth * items.length) / (items.length + 1);

  return (
    <div className="w-full flex flex-col justify-between h-full select-none">
      {/* Header with Title & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Financial Inflow & Expenditure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Current net position based on grant receipts and disbursements.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 self-end sm:self-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Increase</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Decrease</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Total</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart on Left, Net Position Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center flex-1">
        {/* Left: SVG Waterfall Chart (Col 8) */}
        <div className="lg:col-span-8 relative w-full h-65 flex items-center">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y Axis Header Label */}
            <text
              x={margin.left - 8}
              y={18}
              textAnchor="end"
              fontSize="10.5"
              fontWeight="bold"
              fill="#94a3b8"
              className="select-none"
            >
              Amount (₹ Cr)
            </text>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((val, i) => {
              const y = scaleY(val);
              const isZero = val === 0;
              const label = `${(val / 10000000).toFixed(2)} Cr`;

              return (
                <g key={i}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={svgWidth - margin.right}
                    y2={y}
                    stroke={isZero ? '#94a3b8' : '#e2e8f0'}
                    strokeWidth={isZero ? '1.5' : '1'}
                    strokeDasharray={isZero ? 'none' : '4 4'}
                    className={
                      isZero ? 'dark:stroke-slate-500' : 'dark:stroke-slate-800'
                    }
                  />
                  <text
                    x={margin.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10.5"
                    fontWeight={isZero ? '900' : 'bold'}
                    fill={isZero ? '#64748b' : '#94a3b8'}
                  >
                    {isZero ? '0' : label}
                  </text>
                </g>
              );
            })}

            {/* Connecting Dashed Lines */}
            {/* Income to Expenditure */}
            <line
              x1={margin.left + colGap + colWidth}
              y1={scaleY(items[0].end)}
              x2={margin.left + colGap * 2 + colWidth}
              y2={scaleY(items[1].start)}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Expenditure to Net Position */}
            <line
              x1={margin.left + colGap * 2 + colWidth * 2}
              y1={scaleY(items[1].end)}
              x2={margin.left + colGap * 3 + colWidth * 2}
              y2={scaleY(items[2].end)}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Bars */}
            {items.map((item, idx) => {
              const x = margin.left + colGap * (idx + 1) + colWidth * idx;
              const yStart = scaleY(item.start);
              const yEnd = scaleY(item.end);

              const barY = Math.min(yStart, yEnd);
              const barHeight = Math.max(Math.abs(yStart - yEnd), 5);

              const isIncrease = item.type === 'inflow';
              const isDecrease = item.type === 'outflow';

              const barColor = isIncrease
                ? '#10b981' // Green
                : isDecrease
                  ? '#ef4444' // Red
                  : '#3b82f6'; // Blue

              const isAbove = item.end >= 0;
              const labelY = isAbove ? barY - 8 : barY + barHeight + 14;

              const isHovered = hoveredIndex === idx;

              return (
                <g key={idx}>
                  {/* Column Bar */}
                  <rect
                    x={x}
                    y={barY}
                    width={colWidth}
                    height={barHeight}
                    rx="8"
                    fill={barColor}
                    opacity={isHovered ? 1 : 0.9}
                    className="transition-all duration-200 cursor-pointer hover:scale-y-[1.01]"
                    onClick={() => onElementClick?.(item.label)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Value Text */}
                  <text
                    x={x + colWidth / 2}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="800"
                    fill={barColor}
                    className="select-none"
                  >
                    {isIncrease
                      ? formatCr(item.value)
                      : isDecrease
                        ? `-₹${(item.value / 10000000).toFixed(2)} Cr`
                        : formatCrPlain(item.value)}
                  </text>

                  {/* Category Label at bottom */}
                  <text
                    x={x + colWidth / 2}
                    y={svgHeight - margin.bottom + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#475569"
                    className="dark:fill-slate-300 select-none cursor-pointer"
                    onClick={() => onElementClick?.(item.label)}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Net Position Summary Card (Col 4) */}
        <div className="lg:col-span-4 p-4.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Position
              </span>
              <span
                className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md ${
                  netPosition >= 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {netPosition >= 0 ? 'SURPLUS' : 'DEFICIT'}
              </span>
            </div>

            <div
              className={`text-2xl font-semibold mt-2 tracking-tight tabular-nums ${
                netPosition >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCrPlain(netPosition)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Total Income
              </span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {formatCrPlain(totalIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Total Expenditure
              </span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {formatCrPlain(totalExpense)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Net Position
              </span>
              <span
                className={`font-semibold tabular-nums ${
                  netPosition >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCrPlain(netPosition)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1.5. CIRCULAR ROSE / POLAR AREA CHART (SECTION-WISE SPEND)
// ==========================================
export interface RoseSectionItem {
  id: string;
  name: string;
  code: string;
  spent: number;
}

export interface PolarRoseChartProps {
  data: RoseSectionItem[];
  onSectionClick?: (item: RoseSectionItem) => void;
}

export const PolarRoseChart: React.FC<PolarRoseChartProps> = ({
  data,
  onSectionClick,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const colors = [
    '#3b82f6', // HR & Stores - Royal Blue
    '#10b981', // Academics - Emerald Green
    '#f59e0b', // Estate - Amber Orange
    '#8b5cf6', // IT - Purple
    '#ec4899', // Publications - Pink
    '#06b6d4', // Library - Cyan
    '#f43f5e', // Research - Rose Red
    '#6366f1', // Admin - Indigo
  ];

  const maxVal = Math.max(...data.map(d => d.spent), 1);
  const totalSpend = data.reduce((acc, d) => acc + d.spent, 0);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const center = 100;
  const maxRadius = 88;
  const minRadius = 18;
  const count = data.length || 1;
  const sliceAngle = (2 * Math.PI) / count;

  return (
    <div className="w-full flex flex-col justify-between h-full select-none">
      {/* Header with Table Toggle */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Section-wise Spend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              The government budget classification the spend falls under.
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            setViewMode(prev => (prev === 'chart' ? 'table' : 'chart'))
          }
          className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-primary transition cursor-pointer shadow-xs"
        >
          {viewMode === 'chart' ? 'Table' : 'Chart'}
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto py-2">
          <table className="w-full text-left text-xs sm:text-sm font-medium">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-bold text-slate-400">
                <th className="pb-2">Section</th>
                <th className="pb-2">Code</th>
                <th className="pb-2 text-right">Spend</th>
                <th className="pb-2 text-right">% Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item, idx) => {
                const percent =
                  totalSpend > 0
                    ? ((item.spent / totalSpend) * 100).toFixed(1)
                    : '0';
                const color = colors[idx % colors.length];
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSectionClick?.(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-2.5 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {item.name}
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 font-semibold">
                      {item.code}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.spent)}
                    </td>
                    <td className="py-2.5 text-right text-slate-500 font-semibold">
                      {percent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center my-auto py-1">
          {/* Left: Circular Rose Chart SVG */}
          <div className="sm:col-span-6 flex items-center justify-center relative">
            <svg viewBox="0 0 200 200" className="w-45 h-45 overflow-visible">
              {/* Concentric Guide Circles */}
              {[0.33, 0.66, 1].map((ratio, i) => (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={minRadius + (maxRadius - minRadius) * ratio}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  className="dark:stroke-slate-800"
                />
              ))}

              {/* Rose Petals / Circular Sectors */}
              {data.map((item, idx) => {
                const startAngle = idx * sliceAngle - Math.PI / 2;
                const endAngle = startAngle + sliceAngle;

                // Scale radius proportionally
                const valRatio = Math.max(0.15, item.spent / maxVal);
                const r = minRadius + (maxRadius - minRadius) * valRatio;

                const x1 = center + r * Math.cos(startAngle);
                const y1 = center + r * Math.sin(startAngle);
                const x2 = center + r * Math.cos(endAngle);
                const y2 = center + r * Math.sin(endAngle);

                // SVG Path: M center L x1,y1 A r r 0 0 1 x2,y2 Z
                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                const isHovered = hoveredId === item.id;
                const color = colors[idx % colors.length];

                return (
                  <path
                    key={item.id}
                    d={pathData}
                    fill={color}
                    fillOpacity={isHovered ? 0.95 : 0.8}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="dark:stroke-slate-900 transition-all duration-200 cursor-pointer hover:opacity-100"
                    onClick={() => onSectionClick?.(item)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                );
              })}

              {/* Inner Center Circle */}
              <circle
                cx={center}
                cy={center}
                r={minRadius}
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="1"
                className="dark:fill-slate-900 dark:stroke-slate-800"
              />
            </svg>
          </div>

          {/* Right: Legend and formatted values */}
          <div className="sm:col-span-6 flex flex-col gap-2 justify-center">
            {data.map((item, idx) => {
              const color = colors[idx % colors.length];
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSectionClick?.(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    isHovered
                      ? 'bg-slate-100 dark:bg-slate-800 text-primary'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                    {formatCurrency(item.spent)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer explanation note matching screenshot */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Every Section keeps an equal wedge; the radius carries the amount, so
          a small Section stays readable and clickable.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 2. FUNNEL CHART (BUDGET DEMAND PIPELINE)
// ==========================================
export interface FunnelStage {
  stage: string;
  count: number;
  amount: number;
  percentage: number;
  subtitle?: string;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  onStageClick?: (stageName: string) => void;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  stages,
  onStageClick,
}) => {
  const stagePalettes = [
    {
      cardBorder: 'border-blue-200 dark:border-blue-900/60',
      labelBg:
        'bg-blue-50/90 dark:bg-blue-950/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60',
      labelText: 'text-blue-900 dark:text-blue-100',
      countBg: '#1d4ed8', // Deep Navy Blue
      amountBg:
        'bg-blue-50/90 dark:bg-blue-950/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60',
      amountText: 'text-blue-950 dark:text-blue-100',
      dividerBorder: 'border-blue-200/80 dark:border-blue-800/80',
    },
    {
      cardBorder: 'border-amber-200 dark:border-amber-900/60',
      labelBg:
        'bg-amber-50/90 dark:bg-amber-950/50 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60',
      labelText: 'text-amber-900 dark:text-amber-100',
      countBg: '#d97706', // Amber
      amountBg:
        'bg-amber-50/90 dark:bg-amber-950/50 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60',
      amountText: 'text-amber-950 dark:text-amber-100',
      dividerBorder: 'border-amber-200/80 dark:border-amber-800/80',
    },
    {
      cardBorder: 'border-emerald-200 dark:border-emerald-900/60',
      labelBg:
        'bg-emerald-50/90 dark:bg-emerald-950/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60',
      labelText: 'text-emerald-900 dark:text-emerald-100',
      countBg: '#059669', // Emerald
      amountBg:
        'bg-emerald-50/90 dark:bg-emerald-950/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60',
      amountText: 'text-emerald-950 dark:text-emerald-100',
      dividerBorder: 'border-emerald-200/80 dark:border-emerald-800/80',
    },
    {
      cardBorder: 'border-slate-200 dark:border-slate-800',
      labelBg:
        'bg-slate-50/90 dark:bg-slate-900/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60',
      labelText: 'text-slate-800 dark:text-slate-200',
      countBg: '#0f766e', // Teal
      amountBg:
        'bg-slate-50/90 dark:bg-slate-900/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60',
      amountText: 'text-slate-900 dark:text-slate-100',
      dividerBorder: 'border-slate-200/80 dark:border-slate-800/80',
    },
  ];

  const formatAmount = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col gap-2.5 py-1 select-none">
      {stages.map((item, idx) => {
        const palette = stagePalettes[idx % stagePalettes.length];

        return (
          <div key={idx} className="w-full">
            {/* Stage Row */}
            <div
              className={`w-full flex items-stretch gap-0 rounded-xl overflow-hidden border shadow-2xs ${palette.cardBorder} cursor-pointer hover:shadow-md transition-all group`}
              onClick={() => onStageClick?.(item.stage)}
            >
              {/* Stage Label (left) */}
              <div
                className={`flex items-center px-3.5 py-3 ${palette.labelBg} border-r ${palette.dividerBorder} min-w-32.5 transition-colors`}
              >
                <span
                  className={`text-xs sm:text-sm font-semibold ${palette.labelText} leading-tight`}
                >
                  {item.stage}
                </span>
              </div>

              {/* Count Block (center, stage-colored) */}
              <div
                className="flex-1 flex items-center justify-center px-4 py-3 text-white font-semibold text-base tracking-tight shadow-inner tabular-nums"
                style={{ backgroundColor: palette.countBg }}
              >
                {item.count}
              </div>

              {/* Amount (right) */}
              <div
                className={`flex items-center px-3.5 py-3 ${palette.amountBg} border-l ${palette.dividerBorder} shrink-0 transition-colors`}
              >
                <span
                  className={`text-xs sm:text-sm font-semibold tabular-nums ${palette.amountText}`}
                >
                  {formatAmount(item.amount)}
                </span>
              </div>
            </div>

            {/* Subtitle between stages */}
            {item.subtitle && idx < stages.length - 1 && (
              <div className="flex items-center gap-1.5 px-2 py-1">
                <div className="w-4 border-l-2 border-slate-300 dark:border-slate-600 self-stretch ml-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {item.subtitle}
                </span>
              </div>
            )}
            {!item.subtitle && idx < stages.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>
            )}
          </div>
        );
      })}

      {/* Caption */}
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
        A stage counts every line that has reached it. Click a stage for the
        lines sitting there now.
      </p>
    </div>
  );
};

// ==========================================
// 2.5 DUMBBELL / RANGE CHART (BUDGET VS ACTUAL)
// ==========================================
export interface DumbbellItem {
  id: string;
  name: string;
  approved: number; // left anchor (approved budget)
  utilized: number; // right anchor (actual spend)
}

export interface DumbbellChartProps {
  data: DumbbellItem[];
  onRowClick?: (id: string) => void;
}

export const DumbbellChart: React.FC<DumbbellChartProps> = ({
  data,
  onRowClick,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredDot, setHoveredDot] = useState<{
    id: string;
    type: 'approved' | 'utilized';
  } | null>(null);
  const [showTable, setShowTable] = useState(false);
  const { primaryColor } = useThemeStore();
  const activeColor =
    PRIMARY_COLORS.find(c => c.id === primaryColor) || PRIMARY_COLORS[0];

  const formatL = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN')}`;
  };

  // Sort: most overdrawn first
  const sorted = [...data].sort(
    (a, b) => b.utilized - b.approved - (a.utilized - a.approved)
  );

  const maxVal = Math.max(...data.flatMap(d => [d.approved, d.utilized]), 1);

  // x-axis ticks: 0, 25%, 50%, 75%, 100%
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => ({
    val: maxVal * r,
    pct: r * 100,
  }));

  if (showTable) {
    return (
      <div className="flex flex-col h-full select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Budget vs Actual by Project
            </h3>
            <p className="text-[10px] text-slate-400 font-normal">
              Sorted by variance. The most overdrawn sits at the top.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Approved
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: activeColor.hex }}
                />
                Utilized
              </span>
            </div>
            <button
              onClick={() => setShowTable(false)}
              className="text-[10px] font-bold px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Chart
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                <th className="pb-1.5 pr-2">Project</th>
                <th className="pb-1.5 text-right">Approved</th>
                <th className="pb-1.5 text-right">Utilized</th>
                <th className="pb-1.5 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.map(row => {
                const variance = row.utilized - row.approved;
                const isOver = variance > 0;
                const pct =
                  row.approved > 0
                    ? Math.round((row.utilized / row.approved) * 100)
                    : 0;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-2 pr-2 font-bold text-slate-800 dark:text-slate-200 max-w-50 truncate">
                      {row.name}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatL(row.approved)}
                    </td>
                    <td
                      className="py-2 text-right font-mono font-bold"
                      style={{ color: activeColor.hex }}
                    >
                      {formatL(row.utilized)}
                    </td>
                    <td
                      className={`py-2 text-right font-black font-mono ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                      {isOver ? `${pct}% over` : `${pct}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[9.5px] text-slate-400 mt-2 font-medium leading-relaxed">
          Each row runs from what was approved to what has been drawn. Click a
          row to open the project.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Budget vs Actual by Project
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Sorted by variance. The most overdrawn sits at the top.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Approved
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: activeColor.hex }}
              />
              Utilized
            </span>
          </div>
          <button
            onClick={() => setShowTable(true)}
            className="text-[10px] font-bold px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Table
          </button>
        </div>
      </div>

      {/* Scrollable Container for Mobile Horizontal Scrolling */}
      <div className="overflow-x-auto flex-1 custom-scrollbar pb-2 -mx-1 px-1">
        <div className="min-w-155">
          {/* X-Axis Scale Header */}
          <div className="flex items-center w-full px-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            <div className="w-57.5 sm:w-70 shrink-0" />
            <div className="flex-1 relative h-5 ml-3">
              {ticks.map((t, idx) => (
                <div
                  key={idx}
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${t.pct}%` }}
                >
                  <span className="whitespace-nowrap font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                    {t.val >= 10000000
                      ? `₹${(t.val / 10000000).toFixed(1)} Cr`
                      : t.val >= 100000
                        ? `₹${(t.val / 100000).toFixed(0)} L`
                        : t.val === 0
                          ? '₹0'
                          : `₹${t.val.toLocaleString('en-IN')}`}
                  </span>
                  <span className="w-0.5 h-1.5 bg-slate-300 dark:bg-slate-600 mt-0.5" />
                </div>
              ))}
            </div>
            <div className="w-40 shrink-0 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 pl-2">
              <span className="w-21.25 text-right">Utilized</span>
              <span className="w-17.5 text-right">% Util</span>
            </div>
          </div>

          {/* Row List */}
          <div className="flex-1 flex flex-col justify-around gap-2">
            {sorted.map(row => {
              const isOver = row.utilized > row.approved;
              const isHovered = hoveredId === row.id;
              const pct =
                row.approved > 0
                  ? Math.round((row.utilized / row.approved) * 100)
                  : 0;

              const approvedPct = Math.min(100, (row.approved / maxVal) * 100);
              const utilizedPct = Math.min(100, (row.utilized / maxVal) * 100);

              const leftEdge = Math.min(approvedPct, utilizedPct);
              const rightEdge = Math.max(approvedPct, utilizedPct);
              const lineWidth = Math.max(1, rightEdge - leftEdge);

              return (
                <div
                  key={row.id}
                  onClick={() => onRowClick?.(row.id)}
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex items-center w-full px-2 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                    isHovered
                      ? 'bg-slate-100/80 dark:bg-slate-800/60 shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Left: Project Title (Multi-line text wrapping) */}
                  <div
                    className="w-57.5 sm:w-70 shrink-0 text-xs font-bold text-slate-850 dark:text-slate-100 leading-snug whitespace-normal wrap-break-word pr-3"
                    title={row.name}
                  >
                    {row.name}
                  </div>

                  {/* Middle: Dumbbell Track */}
                  <div className="flex-1 relative h-7 flex items-center ml-3">
                    {/* Background dashed ruler line */}
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Vertical tick guide lines */}
                    {ticks.map((t, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 w-px bg-slate-200/80 dark:bg-slate-800 pointer-events-none"
                        style={{ left: `${t.pct}%` }}
                      />
                    ))}

                    {/* Vertical active tracking line on row hover */}
                    {isHovered && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-indigo-500/40 dark:bg-indigo-400/40 pointer-events-none transition-all duration-150"
                        style={{
                          left: `${hoveredDot ? (hoveredDot.type === 'approved' ? approvedPct : utilizedPct) : rightEdge}%`,
                        }}
                      />
                    )}

                    {/* Connecting Line (Thicker bar: h-2.5) */}
                    <div
                      className="absolute h-2.5 rounded-full transition-all duration-300 shadow-2xs opacity-90 hover:opacity-100"
                      style={{
                        left: `${leftEdge}%`,
                        width: `${lineWidth}%`,
                        backgroundColor: isOver ? '#ef4444' : '#0d9488',
                      }}
                    />

                    {/* Approved Dot (Green, Enlarged w-4.5 h-4.5 with interactive hover & tooltips) */}
                    <div
                      className={`group/dot absolute w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-md cursor-pointer transition-all duration-200 -translate-x-1/2 flex items-center justify-center hover:scale-130 hover:ring-4 hover:ring-emerald-500/30 ${
                        hoveredDot?.id === row.id &&
                        hoveredDot?.type === 'approved'
                          ? 'scale-130 ring-4 ring-emerald-500/40 z-30'
                          : isHovered
                            ? 'z-20 scale-110'
                            : 'z-10'
                      }`}
                      style={{
                        left: `${approvedPct}%`,
                      }}
                      onMouseEnter={e => {
                        e.stopPropagation();
                        setHoveredDot({ id: row.id, type: 'approved' });
                      }}
                      onMouseLeave={() => setHoveredDot(null)}
                    >
                      {/* Approved Floating Tooltip */}
                      {(hoveredDot?.id === row.id &&
                        hoveredDot?.type === 'approved') ||
                      (isHovered && !hoveredDot) ? (
                        <div
                          className={`absolute ${
                            Math.abs(approvedPct - utilizedPct) < 14 &&
                            approvedPct > utilizedPct
                              ? 'top-full mt-2'
                              : 'bottom-full mb-2'
                          } left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10.5px] font-black rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50 transition-all duration-150 animate-in fade-in zoom-in-95`}
                        >
                          Approved: {formatL(row.approved)}
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                              Math.abs(approvedPct - utilizedPct) < 14 &&
                              approvedPct > utilizedPct
                                ? 'bottom-full border-b-slate-900 dark:border-b-slate-100'
                                : 'top-full border-t-slate-900 dark:border-t-slate-100'
                            }`}
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* Utilized Dot (Theme Color / Overdrawn Red, Enlarged w-4.5 h-4.5) */}
                    <div
                      className={`group/dot absolute w-4.5 h-4.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md cursor-pointer transition-all duration-200 -translate-x-1/2 flex items-center justify-center hover:scale-130 hover:ring-4 ${
                        isOver
                          ? 'hover:ring-rose-500/30'
                          : 'hover:ring-teal-500/30'
                      } ${
                        hoveredDot?.id === row.id &&
                        hoveredDot?.type === 'utilized'
                          ? 'scale-130 ring-4 ring-indigo-500/40 z-30'
                          : isHovered
                            ? 'z-25 scale-110'
                            : 'z-15'
                      }`}
                      style={{
                        left: `${utilizedPct}%`,
                        backgroundColor: isOver ? '#dc2626' : activeColor.hex,
                      }}
                      onMouseEnter={e => {
                        e.stopPropagation();
                        setHoveredDot({ id: row.id, type: 'utilized' });
                      }}
                      onMouseLeave={() => setHoveredDot(null)}
                    >
                      {/* Utilized Floating Tooltip */}
                      {(hoveredDot?.id === row.id &&
                        hoveredDot?.type === 'utilized') ||
                      (isHovered && !hoveredDot) ? (
                        <div
                          className={`absolute ${
                            Math.abs(approvedPct - utilizedPct) < 14 &&
                            utilizedPct >= approvedPct
                              ? 'top-full mt-2'
                              : 'bottom-full mb-2'
                          } left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10.5px] font-black rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50 transition-all duration-150 animate-in fade-in zoom-in-95`}
                        >
                          Utilized: {formatL(row.utilized)} ({pct}%)
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                              Math.abs(approvedPct - utilizedPct) < 14 &&
                              utilizedPct >= approvedPct
                                ? 'bottom-full border-b-slate-900 dark:border-b-slate-100'
                                : 'top-full border-t-slate-900 dark:border-t-slate-100'
                            }`}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Right Columns: Value Column + % Badge Column */}
                  <div className="w-40 shrink-0 flex items-center justify-between gap-2 pl-2">
                    <div className="w-21.25 text-right font-mono font-black text-xs text-slate-900 dark:text-white whitespace-nowrap">
                      {formatL(row.utilized)}
                    </div>
                    <div className="w-17.5 flex items-center justify-end">
                      <span
                        className={`text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded-md whitespace-nowrap text-center ${
                          isOver
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isOver ? `${pct}% over` : `${pct}%`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium mt-2 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-2">
        Each row runs from what was approved to what has been drawn. The longer
        the connector, the further from plan. Click a row to open the project.
      </p>
    </div>
  );
};

// ==========================================
// 3. GANTT / TIMELINE CHART
// ==========================================
interface GanttProjectItem {
  id: string;
  name: string;
  center: string;
  durationValue: number;
  durationUnit: 'Months' | 'Days';
  dateOfPrc?: string;
  approvedCost: number;
  startMonthOffset: number; // 0 (April) to 11 (March)
}

interface GanttChartProps {
  projects: GanttProjectItem[];
  onProjectClick?: (projectId: string) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  projects,
  onProjectClick,
}) => {
  // Financial Year calendar starting in April
  const months = [
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar',
  ];

  return (
    <div className="w-full overflow-x-auto select-none border border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="min-w-200 bg-white dark:bg-slate-900 flex flex-col text-xs">
        {/* Timeline Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 font-bold text-slate-500 dark:text-slate-400">
          <div className="w-1/3 p-3.5 border-r border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            Project & Cost Center
          </div>
          <div className="w-2/3 grid grid-cols-12 text-center uppercase tracking-wider text-[10px]">
            {months.map((m, idx) => (
              <div
                key={m}
                className={`p-3.5 ${idx < 11 ? 'border-r border-slate-100 dark:border-slate-800/40' : ''}`}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Project Lanes */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
          {projects.map((project, idx) => {
            // Determine span across the 12 columns
            const startCol = Math.max(
              0,
              Math.min(11, project.startMonthOffset)
            );

            // Calculate duration in months. If duration unit is 'Days', approximate
            const durationInMonths =
              project.durationUnit === 'Months'
                ? project.durationValue
                : Math.ceil(project.durationValue / 30);

            const endCol = Math.min(12, startCol + durationInMonths);

            // Generate CSS classes for grid positioning
            const gridStart = startCol + 1;
            const gridEnd = endCol + 1;

            const hasPrc = !!project.dateOfPrc;

            const ganttGradients = [
              'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', // Sky Blue
              'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', // Teal
              'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
              'linear-gradient(135deg, #d97706 0%, #b45309 100%)', // Amber
              'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
              'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Violet
              'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', // Royal Blue
            ];
            const laneBackground = ganttGradients[idx % ganttGradients.length];

            return (
              <div
                key={project.id}
                className="flex items-stretch hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition group"
              >
                {/* Project details left column */}
                <div
                  className="w-1/3 p-3.5 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => onProjectClick?.(project.id)}
                >
                  <span className="font-semibold text-slate-850 dark:text-slate-200 line-clamp-1 group-hover:text-primary">
                    {project.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
                    {project.center} • ₹
                    {(project.approvedCost / 100000).toFixed(1)}L
                  </span>
                </div>

                {/* Timeline visual grid */}
                <div className="w-2/3 grid grid-cols-12 relative items-center px-1">
                  {/* Grid background dividers */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-full ${idx < 11 ? 'border-r border-slate-100 dark:border-slate-800/20' : ''}`}
                      />
                    ))}
                  </div>

                  {/* Duration Span Bar */}
                  <div
                    className="relative py-2.5 rounded-xl text-white font-bold select-none cursor-pointer flex items-center justify-between px-3 shadow-2xs hover:shadow-sm transition-all group/bar"
                    style={{
                      gridColumnStart: gridStart,
                      gridColumnEnd: gridEnd,
                      background: laneBackground,
                    }}
                    onClick={() => onProjectClick?.(project.id)}
                  >
                    <span className="text-[10px] tracking-tight truncate select-none">
                      {project.durationValue} {project.durationUnit}
                    </span>

                    {/* PRC Date Marker Pin */}
                    {hasPrc && (
                      <div
                        className="flex items-center gap-1 bg-black/40 backdrop-blur-xs text-[9px] px-1.5 py-0.5 rounded border border-white/20 select-none shrink-0 group-hover/bar:bg-black/70 transition"
                        title={`Date of PRC: ${project.dateOfPrc}`}
                      >
                        <Milestone className="w-2.5 h-2.5 text-emerald-450" />
                        <span>PRC</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. HEAD-WISE BUDGET VS ACTUAL (HORIZONTAL BARS)
// ==========================================
export interface HeadWiseItem {
  id: string;
  particulars: string;
  Budget: number;
  Spent: number;
}

export interface HeadWiseBudgetChartProps {
  data: HeadWiseItem[];
  onHeadClick?: (head: HeadWiseItem) => void;
}

export const HeadWiseBudgetChart: React.FC<HeadWiseBudgetChartProps> = ({
  data,
  onHeadClick,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { primaryColor } = useThemeStore();
  const activeColor =
    PRIMARY_COLORS.find(c => c.id === primaryColor) || PRIMARY_COLORS[0];

  const maxVal = Math.max(...data.flatMap(d => [d.Budget, d.Spent]), 1);

  const formatL = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
    if (abs === 0) return '₹0';
    return `₹${v.toLocaleString('en-IN')}`;
  };

  if (showTable) {
    return (
      <div className="flex flex-col h-full select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Head-wise Budget vs Actual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                The Project master's heads, in its order. Click a head to open
                its sub-heads.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTable(false)}
            className="text-xs font-medium px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition cursor-pointer shadow-xs"
          >
            Chart
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                <th className="pb-2 pr-3">Head Particulars</th>
                <th className="pb-2 text-right">Sanctioned Outlay</th>
                <th className="pb-2 text-right">Actual Spent</th>
                <th className="pb-2 text-right">Utilization %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map(item => {
                const pct =
                  item.Budget > 0
                    ? Math.round((item.Spent / item.Budget) * 100)
                    : 0;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onHeadClick?.(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-2.5 pr-3 font-bold text-slate-800 dark:text-slate-200">
                      {item.particulars}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatL(item.Budget)}
                    </td>
                    <td
                      className="py-2.5 text-right font-mono font-bold"
                      style={{ color: activeColor.hex }}
                    >
                      {formatL(item.Spent)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full select-none justify-between">
      {/* Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs font-semibold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Head-wise Budget vs Actual
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              The Project master's heads, in its order. Click a head to open its
              sub-heads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-teal-600 inline-block" />
              Budgeted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-teal-900 dark:bg-teal-300 inline-block" />
              Actual
            </span>
          </div>
          <button
            onClick={() => setShowTable(true)}
            className="text-xs font-bold px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Table
          </button>
        </div>
      </div>

      {/* Horizontal Progress Rows matching Image 2 */}
      <div className="flex-1 flex flex-col justify-center gap-3.5 py-1">
        {data.map(item => {
          const isHovered = hoveredId === item.id;
          const pct =
            item.Budget > 0 ? Math.round((item.Spent / item.Budget) * 100) : 0;
          const budgetPct = Math.min(100, (item.Budget / maxVal) * 100);
          const spentPct = Math.min(100, (item.Spent / maxVal) * 100);

          return (
            <div
              key={item.id}
              onClick={() => onHeadClick?.(item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-150 ${
                isHovered
                  ? 'bg-slate-100/80 dark:bg-slate-800/60 shadow-2xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              {/* Chevron icon + Particulars */}
              <div className="w-45 sm:w-55 shrink-0 flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span
                  className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight truncate"
                  title={item.particulars}
                >
                  {item.particulars}
                </span>
              </div>

              {/* Horizontal Dual Progress Bar (Image 2 style) */}
              <div className="flex-1 relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {/* Budgeted bar (Background teal/emerald track) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-teal-500/30 dark:bg-teal-500/40 rounded-full transition-all duration-300"
                  style={{ width: `${budgetPct}%` }}
                />
                {/* Actual spent bar (Foreground dark teal/emerald fill) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-teal-700 dark:bg-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${spentPct}%` }}
                />
              </div>

              {/* Right column: Amount + Percentage Badge */}
              <div className="w-30 shrink-0 flex items-center justify-end gap-2 font-mono text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                  {formatL(item.Spent)}
                </span>
                <span className="text-[10.5px] font-black text-slate-600 dark:text-slate-300 shrink-0">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Caption matching Image 2 */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2">
        A head shows an actual only when it names the ledger its spend lands in.
        The rest show their budget alone.
      </p>
    </div>
  );
};
