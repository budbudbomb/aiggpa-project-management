import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  User,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  DownloadSimple,
  ArrowBendUpRight,
  Camera,
} from '@phosphor-icons/react';
import { useAuthStore } from '../../auth/store/authStore';
import type { Complaint } from '../../stores/types';
import {
  complaintCategoryLabel,
  complaintStatusLabel,
  complaintStatusColor,
  complaintPriorityLabel,
  complaintPriorityColor,
  roleLabel,
  formatDate,
} from '../../lib/utils/formatters';

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  canReview?: boolean;
  onOpenReview?: (
    complaint: Complaint,
    action: 'resolve' | 'reject' | 'forward'
  ) => void;
}

export default function ComplaintDetailsModal({
  complaint,
  onClose,
  canReview = false,
  onOpenReview,
}: ComplaintDetailsModalProps) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const isAdvisor = user?.role === 'Advisor';
  const isCenterHead =
    user?.role === 'Center Head' || user?.role === 'Super Admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!complaint) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const mainEl = document.querySelector('main');
    const origMainOverflow = mainEl ? mainEl.style.overflow : '';
    if (mainEl) mainEl.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
      if (mainEl) mainEl.style.overflow = origMainOverflow;
    };
  }, [complaint]);

  if (!complaint || !mounted) return null;

  const photoEvidenceUrl = complaint.photoUrl;
  const photoEvidenceName = complaint.photoName;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden transition-all transform animate-scale-in"
      >
        {/* Header - Fixed at Top */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded-md">
                {complaint.ticketNumber}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${complaintStatusColor(
                  complaint.status
                )}`}
              >
                {complaintStatusLabel(complaint.status)}
              </span>
              {complaint.priority && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${complaintPriorityColor(
                    complaint.priority
                  )}`}
                >
                  {complaintPriorityLabel(complaint.priority)} Priority
                </span>
              )}
              {complaint.isEscalated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                  <ArrowBendUpRight size={12} weight="bold" />
                  Forwarded{' '}
                  {complaint.escalations && complaint.escalations.length > 0
                    ? `from ${roleLabel(complaint.escalations[complaint.escalations.length - 1].forwarderRole)}`
                    : ''}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {complaint.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-4 shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Applicant
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm font-semibold text-slate-800">
                <User size={14} className="text-blue-600 shrink-0" />
                <span className="truncate">{complaint.applicantName}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {roleLabel(complaint.applicantRole)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Location
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm font-medium text-slate-800">
                <MapPin size={14} className="text-blue-600 shrink-0" />
                <span className="truncate">
                  {complaint.assignedLocation || 'Assigned Location'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Category
              </span>
              <span className="inline-block mt-1 text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {complaintCategoryLabel(complaint.category)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Applied Date
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-700">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <span>
                  {formatDate(complaint.appliedAt, 'dd MMM yyyy, HH:mm')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Complaint Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </div>
          </div>

          {/* Incident date if specified */}
          {complaint.incidentDate && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">
                Date of Incident / Occurrence:{' '}
              </span>
              {formatDate(complaint.incidentDate)}
            </div>
          )}

          {/* Photo / Picture Evidence Section */}
          {(photoEvidenceUrl || photoEvidenceName) && (
            <div>
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Camera size={16} className="text-blue-600" />
                Attached Picture / Photo Evidence
              </h3>
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-blue-950">
                  <span className="truncate">
                    {photoEvidenceName || 'photo_evidence.jpg'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Photo Attachment
                  </span>
                </div>
                {photoEvidenceUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={photoEvidenceUrl}
                      alt={photoEvidenceName || 'Complaint Evidence'}
                      className="w-28 h-20 rounded-lg object-cover border border-blue-200 shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setViewingPhotoUrl(photoEvidenceUrl)}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 mb-1">
                        Photograph attached by applicant
                      </p>
                      <button
                        type="button"
                        onClick={() => setViewingPhotoUrl(photoEvidenceUrl)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                      >
                        View Full Size Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-blue-200 text-xs text-blue-700">
                    Image evidence attached: {photoEvidenceName}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Attachment */}
          {complaint.documentName && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Supporting Document
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                      {complaint.documentName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supporting file
                    </p>
                  </div>
                </div>
                <a
                  href={complaint.documentUrl || '#'}
                  download={complaint.documentName}
                  onClick={e => {
                    if (
                      !complaint.documentUrl ||
                      complaint.documentUrl === '#'
                    ) {
                      e.preventDefault();
                      alert(
                        `Mock download triggered for: ${complaint.documentName}`
                      );
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors"
                >
                  <DownloadSimple size={14} weight="bold" />
                  Download
                </a>
              </div>
            </div>
          )}

          {/* Escalation & Forwarding Trail */}
          {((complaint.escalations && complaint.escalations.length > 0) ||
            complaint.isEscalated) && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ArrowBendUpRight size={14} weight="bold" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950">
                  Escalation & Forwarding Trail
                </h4>
                <span className="ml-auto text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200/80">
                  Hierarchical Escalation
                </span>
              </div>

              {complaint.escalations && complaint.escalations.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {complaint.escalations.map((esc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/95 border border-blue-100 rounded-lg text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">
                          Forwarded by{' '}
                          <strong className="text-blue-900">
                            {esc.forwardedBy}
                          </strong>{' '}
                          ({roleLabel(esc.forwarderRole)})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(esc.forwardedAt, 'dd MMM yyyy, HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
                        <ArrowBendUpRight size={13} weight="bold" />
                        <span>
                          Escalated to: <strong>{esc.forwardedToLabel}</strong>
                        </span>
                      </div>
                      <div className="text-slate-600 bg-slate-50 border border-slate-200/70 rounded p-2 text-xs italic">
                        &ldquo;{esc.reason}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-800">
                  This grievance was forwarded up the hierarchy for higher
                  administrative review.
                </p>
              )}
            </div>
          )}

          {/* Review Status & Feedback */}
          {complaint.status === 'escalated' && (
            <div className="p-4 rounded-xl border bg-blue-50/70 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ArrowBendUpRight
                  size={18}
                  weight="bold"
                  className="text-blue-600 shrink-0"
                />
                <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                  Escalated to Center Head for Final Decision
                </h4>
                {complaint.forwardedBy && (
                  <span className="text-[11px] text-blue-700 ml-auto">
                    Moved by <strong>{complaint.forwardedBy}</strong> (Advisor)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-line leading-relaxed m-0">
                {complaint.forwardComment ||
                  complaint.reviewerComment ||
                  'Escalated to Center Head as Advisor was unable to resolve at their level.'}
              </p>
            </div>
          )}

          {(complaint.status === 'resolved' ||
            complaint.status === 'rejected') && (
            <div
              className={`p-4 rounded-xl border ${
                complaint.status === 'resolved'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {complaint.status === 'resolved' ? (
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-emerald-600 shrink-0"
                  />
                ) : (
                  <XCircle
                    size={18}
                    weight="fill"
                    className="text-rose-600 shrink-0"
                  />
                )}
                <h4
                  className={`text-xs sm:text-sm font-bold ${
                    complaint.status === 'resolved'
                      ? 'text-emerald-900'
                      : 'text-rose-900'
                  }`}
                >
                  {complaint.status === 'resolved'
                    ? 'Resolution Remarks'
                    : 'Rejection Reason'}
                </h4>
                {complaint.reviewedBy && (
                  <span className="text-[11px] text-slate-500 ml-auto">
                    By{' '}
                    <strong className="text-slate-700">
                      {complaint.reviewedBy}
                    </strong>
                    {complaint.reviewedAt &&
                      ` on ${formatDate(complaint.reviewedAt, 'dd MMM yyyy')}`}
                  </span>
                )}
              </div>
              <p
                className={`text-xs sm:text-sm ${
                  complaint.status === 'resolved'
                    ? 'text-emerald-800'
                    : 'text-rose-800'
                } whitespace-pre-line leading-relaxed m-0`}
              >
                {complaint.reviewerComment || 'No remarks provided.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>

          {canReview &&
            onOpenReview &&
            (complaint.status === 'pending' ||
              (complaint.status === 'escalated' && isCenterHead)) && (
              <div className="flex items-center gap-2 flex-wrap">
                {isAdvisor && complaint.status === 'pending' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReview(complaint, 'forward');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                    title="Move to Center Head if unable to resolve"
                  >
                    <ArrowBendUpRight size={16} weight="bold" />
                    <span>Move to Center Head</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    onOpenReview(complaint, 'reject');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  <XCircle size={16} weight="bold" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReview(complaint, 'resolve');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle size={16} weight="bold" />
                  Resolve Grievance
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Full Photo Modal Viewer */}
      {viewingPhotoUrl && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Photo Evidence
              </span>
              <button
                type="button"
                onClick={() => setViewingPhotoUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={viewingPhotoUrl}
              alt="Full evidence"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
