import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AdminSurvey } from '../../stores/types';
import SurveyFillForm from './SurveyFillForm';

interface SurveyFillModalProps {
  survey: AdminSurvey | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SurveyFillModal({
  survey,
  onClose,
  onSuccess,
}: SurveyFillModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!survey) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [survey]);

  if (!survey || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        <SurveyFillForm
          survey={survey}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
