import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle,
  XCircle,
  ChatText,
  ArrowBendUpRight,
} from '@phosphor-icons/react';
import { toast } from '../../shared/components/feedback';
import ComplaintStore from '../../stores/complaintStore';
import { useAuthStore } from '../../auth/store/authStore';
import type { Complaint } from '../../stores/types';

interface ReviewComplaintModalProps {
  complaint: Complaint | null;
  action: 'resolve' | 'reject' | 'forward' | null;
  reviewerRole?: string;
  onClose: () => void;
  onSuccess: (updated: Complaint) => void;
}

export default function ReviewComplaintModal({
  complaint,
  action,
  reviewerRole,
  onClose,
  onSuccess,
}: ReviewComplaintModalProps) {
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!complaint || !action) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [complaint, action]);

  if (!complaint || !action || !mounted) return null;

  const isResolve = action === 'resolve';
  const isReject = action === 'reject';
  const isForward = action === 'forward';

  const roleName = reviewerRole || user?.role || 'Advisor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResolve && !comment.trim()) {
      toast.error(
        isForward
          ? 'Please specify the reason for moving the complaint to Center Head'
          : 'Please specify the reason for rejection'
      );
      return;
    }

    setLoading(true);
    try {
      const reviewer = {
        name: user?.name ?? 'Reviewing Authority',
        role: roleName,
      };

      let updated: Complaint | null = null;
      if (isResolve) {
        updated = ComplaintStore.resolve(
          complaint.id,
          comment.trim() || undefined,
          reviewer
        );
        toast.success(`Complaint ${complaint.ticketNumber} marked as Resolved`);
      } else if (isReject) {
        updated = ComplaintStore.reject(complaint.id, comment.trim(), reviewer);
        toast.success(`Complaint ${complaint.ticketNumber} has been rejected`);
      } else {
        updated = ComplaintStore.forwardToCenterHead(
          complaint.id,
          comment.trim(),
          reviewer
        );
        toast.success(
          `Complaint ${complaint.ticketNumber} moved to Center Head for executive review`
        );
      }

      if (updated) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden transition-all transform animate-scale-in"
      >
        {/* Header - Fixed at Top */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
            isResolve
              ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900'
              : isReject
                ? 'bg-rose-50/80 border-rose-100 text-rose-900'
                : 'bg-blue-50/80 border-blue-100 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isResolve
                  ? 'bg-emerald-100 text-emerald-700'
                  : isReject
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isResolve && <CheckCircle size={20} weight="bold" />}
              {isReject && <XCircle size={20} weight="bold" />}
              {isForward && <ArrowBendUpRight size={20} weight="bold" />}
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {isResolve && 'Resolve Grievance'}
                {isReject && 'Reject Grievance'}
                {isForward && 'Move Grievance to Center Head'}
              </h2>
              <p className="text-xs opacity-80">
                Ticket:{' '}
                <span className="font-mono font-semibold">
                  {complaint.ticketNumber}
                </span>
                {isForward && ' • Escalate for Center Head Decision'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Complaint Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Applicant: <strong>{complaint.applicantName}</strong> (
                {complaint.applicantRole})
              </span>
              <span>{complaint.incidentDate}</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 line-clamp-1 m-0">
              {complaint.subject}
            </p>
          </div>

          {/* Forwarding Notice */}
          {isForward && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Notice:</span>
              <p className="m-0 leading-relaxed text-blue-800">
                As an <strong>Advisor</strong>, moving this complaint will
                escalate it directly to the <strong>Center Head</strong> for
                top-level review and final administrative decision.
              </p>
            </div>
          )}

          {/* Remarks Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ChatText size={15} />
              <span>
                {isResolve && 'Resolution Remarks (Optional)'}
                {isReject && 'Reason for Rejection *'}
                {isForward && 'Reason for Moving to Center Head *'}
              </span>
            </label>
            <textarea
              rows={4}
              required={!isResolve}
              placeholder={
                isResolve
                  ? 'Describe corrective action taken or guidance provided...'
                  : isReject
                    ? 'State specific reasons why this grievance cannot be accepted...'
                    : 'Explain why this grievance cannot be resolved at Advisor level and requires Center Head decision...'
              }
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                isResolve
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : isReject
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isResolve && <CheckCircle size={16} weight="bold" />}
              {isReject && <XCircle size={16} weight="bold" />}
              {isForward && <ArrowBendUpRight size={16} weight="bold" />}
              <span>
                {loading
                  ? 'Processing...'
                  : isResolve
                    ? 'Confirm & Resolve'
                    : isReject
                      ? 'Confirm Rejection'
                      : 'Move to Center Head'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
