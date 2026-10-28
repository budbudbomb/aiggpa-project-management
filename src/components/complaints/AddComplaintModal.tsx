import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  ShieldWarning,
  Calendar,
  FileText,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { toast } from '../../shared/components/feedback';
import ComplaintStore from '../../stores/complaintStore';
import { useAuthStore } from '../../auth/store/authStore';
import type { Complaint } from '../../stores/types';

const schema = z.object({
  category: z.enum([
    'stipend',
    'field_travel',
    'workload_tasks',
    'infrastructure',
    'interpersonal',
    'other',
  ] as const),
  incidentDate: z.string().min(1, 'Date is required'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(120, 'Subject is too long'),
  description: z
    .string()
    .min(10, 'Please provide sufficient details (min 10 characters)'),
});

type FormData = z.infer<typeof schema>;

interface AddComplaintModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
  userRole?: string;
  recipientLabel?: string;
}

export default function AddComplaintModal({
  open,
  onClose,
  onSuccess,
  recipientLabel,
}: AddComplaintModalProps) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!open) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'field_travel',
      incidentDate: new Date().toISOString().split('T')[0],
      subject: '',
      description: '',
    },
  });

  if (!open || !mounted) return null;

  const targetRoleText = recipientLabel ?? 'Advisor & Center Head';

  const onSubmit = async (data: FormData) => {
    try {
      const created = ComplaintStore.addComplaint(
        {
          category: data.category,
          incidentDate: data.incidentDate,
          subject: data.subject,
          description: data.description,
        },
        user
          ? {
              id: user.id,
              name: user.name,
              role: user.role,
              department: user.department,
            }
          : undefined
      );

      toast.success(
        `Grievance ${created.ticketNumber} submitted successfully to ${targetRoleText}!`
      );
      reset();
      onSuccess(created);
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit grievance'
      );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden transition-all transform animate-scale-in"
      >
        {/* Header - Fixed at Top */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldWarning size={22} weight="duotone" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Lodge Grievance / Complaint
              </h2>
              <p className="text-[11px] text-slate-500">
                Routed to:{' '}
                <span className="font-semibold text-slate-700">
                  {targetRoleText}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Taking the 4 common fields */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* Common Field 1 & 2: Category and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="field_travel">Field & Travel Logistics</option>
                <option value="infrastructure">Device, SIM & Portal</option>
                <option value="workload_tasks">Workload & Assignments</option>
                <option value="stipend">Stipend & Allowances</option>
                <option value="interpersonal">Interpersonal Grievance</option>
                <option value="other">Other Inquiry / Issue</option>
              </select>
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident / Grievance Date{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('incidentDate')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.incidentDate && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.incidentDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Common Field 3: Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Concise summary of your grievance"
                {...register('subject')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
              <FileText
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            {errors.subject && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Common Field 4: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="State the circumstances, dates, field locations, and nature of grievance..."
              {...register('description')}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 leading-relaxed resize-y"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <PaperPlaneTilt size={16} weight="bold" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
