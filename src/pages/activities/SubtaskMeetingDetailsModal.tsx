import React, { useEffect, useState } from 'react';
import { Video, Clock, AlignLeft, Link2, X, Check } from 'lucide-react';
import { AppButton } from '../../components';

export interface MeetingDetailsData {
  meetingUrl: string;
  meetingDuration: string;
  meetingDescription: string;
}

interface SubtaskMeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<MeetingDetailsData>;
  onSave: (data: MeetingDetailsData) => void;
}

const DURATION_OPTIONS = [
  '15 mins',
  '30 mins',
  '45 mins',
  '1 hour',
  '1.5 hours',
  '2 hours',
];

export const SubtaskMeetingDetailsModal: React.FC<
  SubtaskMeetingDetailsModalProps
> = ({ isOpen, onClose, initialData, onSave }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('45 mins');
  const [meetingDescription, setMeetingDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMeetingUrl(initialData?.meetingUrl || '');
      setMeetingDuration(initialData?.meetingDuration || '45 mins');
      setMeetingDescription(initialData?.meetingDescription || '');
    }
  }, [isOpen, initialData]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      meetingUrl: meetingUrl.trim(),
      meetingDuration: meetingDuration || '45 mins',
      meetingDescription: meetingDescription.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col transform transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2
                id="meeting-modal-title"
                className="text-base font-bold text-slate-800 tracking-tight"
              >
                Subtask Meeting Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Attach video conference URL, estimated duration, and agenda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4.5">
            {/* Meeting URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Meeting URL{' '}
                <span className="text-[11px] font-normal text-slate-400">
                  (Google Meet, Zoom, MS Teams)
                </span>
              </label>
              <div className="relative flex items-center">
                <Link2 className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={e => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg or Zoom link"
                  className="w-full pl-9.5 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder-slate-400 transition-all font-medium"
                />
              </div>
            </div>

            {/* Meeting Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Estimated Duration
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={meetingDuration}
                  onChange={e => setMeetingDuration(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 transition-all font-medium appearance-none cursor-pointer"
                >
                  {DURATION_OPTIONS.map(dur => (
                    <option key={dur} value={dur}>
                      {dur}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Agenda / Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Agenda / Discussion Points
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={meetingDescription}
                  onChange={e => setMeetingDescription(e.target.value)}
                  placeholder="Key objectives, talking points, or participant requirements..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder-slate-400 transition-all font-medium resize-y"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Details</span>
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubtaskMeetingDetailsModal;
