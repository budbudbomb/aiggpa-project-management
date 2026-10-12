import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { toast, type ToastMessage, type ToastType } from './toastService';
import './Toast.css';

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<
  ToastType,
  {
    bg: string;
    border: string;
    iconColor: string;
    progressColor: string;
  }
> = {
  success: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    progressColor: 'bg-emerald-500 dark:bg-emerald-400',
  },
  warning: {
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-amber-200 dark:border-amber-800/60',
    iconColor: 'text-amber-500 dark:text-amber-400',
    progressColor: 'bg-amber-500 dark:bg-amber-400',
  },
  error: {
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-rose-200 dark:border-rose-800/60',
    iconColor: 'text-rose-500 dark:text-rose-400',
    progressColor: 'bg-rose-500 dark:bg-rose-400',
  },
  info: {
    bg: 'bg-white dark:bg-slate-900',
    border: 'border-blue-200 dark:border-blue-800/60',
    iconColor: 'text-primary dark:text-blue-400',
    progressColor: 'bg-primary dark:bg-blue-400',
  },
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast: item, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const duration = item.duration ?? 3200;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(duration);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(item.id);
    }, 250);
  }, [item.id, onDismiss]);

  const scheduleTimer = useCallback(
    (ms: number) => {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleClose();
      }, ms);
    },
    [handleClose]
  );

  useEffect(() => {
    scheduleTimer(remainingRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleTimer]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(200, remainingRef.current - elapsed);
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    scheduleTimer(remainingRef.current);
  };

  const Icon = toastIcons[item.type];
  const style = toastStyles[item.type];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--toast-duration': `${duration}ms`,
        } as React.CSSProperties
      }
      className={`relative overflow-hidden pointer-events-auto flex items-start gap-3 p-3.5 pb-4 rounded-2xl border shadow-2xl shadow-slate-900/15 dark:shadow-black/60 backdrop-blur-md transition-all duration-250 transform select-none ${
        isExiting
          ? 'opacity-0 translate-x-8 scale-90'
          : 'toast-card-enter opacity-100 translate-x-0 scale-100'
      } ${style.bg} ${style.border}`}
    >
      {/* Toast Icon */}
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 pr-1">
        {item.title && (
          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-0.5">
            {item.title}
          </h5>
        )}
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
          {item.message}
        </p>
      </div>

      {/* Manual Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Decreasing Progress Slider Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
        <div
          className={`toast-progress-slider ${style.progressColor} ${isPaused ? 'paused' : ''}`}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const handleDismiss = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{ zIndex: 999999 }}
      className="fixed top-4 right-4 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map(item => (
        <ToastItem key={item.id} toast={item} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};
