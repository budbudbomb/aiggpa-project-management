import { useEffect, useState } from 'react';

type ToastPayload = { message: string; id: number } | null;

let listener: ((payload: ToastPayload) => void) | null = null;
let hideTimeout: number | undefined;

export function showToast(message: string): void {
  listener?.({ message, id: Date.now() });
}

export function ToastHost(): React.ReactElement {
  const [toast, setToast] = useState<ToastPayload>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    listener = (payload) => {
      setToast(payload);
      setVisible(true);
      window.clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => setVisible(false), 3200);
    };
    return () => {
      listener = null;
      window.clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <div
      id="globalToastBox"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        background: '#1e293b',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '10px',
        fontSize: '0.88rem',
        fontWeight: 600,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        opacity: visible && toast ? '1' : '0',
        transform: visible && toast ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: 'none',
      }}
    >
      <i className="pi pi-check-circle" style={{ color: '#4ade80' }} />
      <span>{toast?.message ?? ''}</span>
    </div>
  );
}
