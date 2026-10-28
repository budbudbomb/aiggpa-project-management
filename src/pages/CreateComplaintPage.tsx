import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldWarning,
  Calendar,
  FileText,
  ArrowLeft,
  PaperPlaneTilt,
  Info,
  CheckCircle,
} from '@phosphor-icons/react';
import { useAuthStore } from '../auth/store/authStore';
import ComplaintStore from '../stores/complaintStore';
import { toast } from '../shared/components/feedback';

const CATEGORY_OPTIONS = [
  { value: 'field_travel', label: 'Field & Travel Logistics' },
  { value: 'infrastructure', label: 'Device, SIM & Survey Portal' },
  { value: 'workload_tasks', label: 'Workload & Task Allocation' },
  { value: 'stipend', label: 'Stipend & Allowances' },
  { value: 'interpersonal', label: 'Interpersonal Grievance' },
  { value: 'other', label: 'Other Inquiry / General Issue' },
];

export default function CreateComplaintPage(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const todayStr = new Date().toISOString().split('T')[0];

  const [category, setCategory] = useState('field_travel');
  const [incidentDate, setIncidentDate] = useState(todayStr);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!category) {
      errs.category = 'Please select a complaint category.';
    }
    if (!incidentDate) {
      errs.incidentDate = 'Please select a date.';
    }
    if (!subject.trim()) {
      errs.subject = 'Subject is required.';
    } else if (subject.trim().length < 5) {
      errs.subject = 'Subject must be at least 5 characters.';
    }
    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      errs.description =
        'Please provide sufficient details (min 10 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = ComplaintStore.addComplaint(
        {
          category,
          incidentDate,
          subject,
          description,
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
        `Grievance ${created.ticketNumber} lodged successfully! Submitted to Advisor / Center Head.`
      );
      navigate('/complaints');
    } catch {
      toast.error('Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Grievances</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            AIGGPA Grievance Redressal Mechanism
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldWarning size={24} weight="duotone" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Lodge Grievance / Formal Complaint
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Submit an operational, field, or administrative grievance to
                senior governance (Advisor & Center Head) for timely redressal.
              </p>
            </div>
          </div>

          {/* Applicant Identification Badge */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Applicant:</span>
              <span className="font-bold text-slate-900">
                {user?.name || 'Authorized Personnel'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                {user?.role || 'Execution Tier'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle size={14} weight="bold" />
              <span className="font-semibold">
                Review Tier: Advisor & Center Head
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 shadow-2xs space-y-6"
        >
          {/* Info Hint */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              Please provide clear and accurate details. Your grievance will be
              reviewed by the <strong>Advisor</strong> or{' '}
              <strong>Center Head</strong>. If the Advisor is unable to resolve
              it, it will be escalated directly to the Center Head.
            </span>
          </div>

          {/* Common Field 1: Category & Common Field 2: Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Incident / Grievance Date{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                <Calendar
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.incidentDate && (
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  {errors.incidentDate}
                </p>
              )}
            </div>
          </div>

          {/* Common Field 3: Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Concise summary of your grievance or issue"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={120}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
              />
              <FileText
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              {errors.subject ? (
                <p className="text-xs text-rose-600 font-semibold m-0">
                  {errors.subject}
                </p>
              ) : (
                <span className="text-[11px] text-slate-400">
                  State the core issue clearly
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                {subject.length}/120
              </span>
            </div>
          </div>

          {/* Common Field 4: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Provide complete facts, specific locations, project details, dates, or circumstances..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-normal leading-relaxed resize-y"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-xs text-rose-600 font-semibold m-0">
                  {errors.description}
                </p>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Minimum 10 characters required
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                {description.length} chars
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <PaperPlaneTilt size={16} weight="bold" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
