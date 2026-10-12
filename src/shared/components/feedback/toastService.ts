export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(toastData: Omit<ToastMessage, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = {
      id,
      duration: toastData.duration ?? 3200,
      ...toastData,
    };
    this.toasts = [...this.toasts, newToast];
    this.notify();
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  success(message: string, title?: string, duration?: number) {
    return this.show({ type: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration?: number) {
    return this.show({ type: 'error', message, title, duration });
  }

  warning(message: string, title?: string, duration?: number) {
    return this.show({ type: 'warning', message, title, duration });
  }

  info(message: string, title?: string, duration?: number) {
    return this.show({ type: 'info', message, title, duration });
  }
}

export const toast = new ToastManager();
