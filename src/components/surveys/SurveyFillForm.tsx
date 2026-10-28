import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Microphone,
  VideoCamera,
  Camera,
  Trash,
  Play,
  Stop,
  X,
  UploadSimple,
  FloppyDisk,
  User,
  Phone,
  MapPin,
  Sparkle,
} from '@phosphor-icons/react';
import type { AdminSurvey, SurveyQuestion } from '../../stores/types';
import SurveyStore from '../../stores/surveyStore';
import { useAuthStore } from '../../auth/store/authStore';
import { toast } from '../../shared/components/feedback';
import { cn } from '../../lib/utils/formatters';
import MediaCaptureModal, {
  type CapturedMediaResult,
} from '../media/MediaCaptureModal';

export interface QuestionMediaAnswer {
  voiceUrl?: string;
  voiceName?: string;
  voiceDuration?: number;
  videoUrl?: string;
  videoName?: string;
  imageUrl?: string;
  imageName?: string;
}

interface SurveyFillFormProps {
  survey: AdminSurvey;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function SurveyFillForm({
  survey,
  onSuccess,
  onClose,
}: SurveyFillFormProps) {
  const { user } = useAuthStore();

  const questions: SurveyQuestion[] = useMemo(() => {
    return survey.questions || [];
  }, [survey.questions]);

  // ── Step State ──
  // Step 0: Respondent Metadata
  // Step 1..N: Individual Survey Questions
  // Step N+1: Summary & Submission Confirmation
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Respondent details
  const [respondentName, setRespondentName] = useState('');
  const [respondentPhone, setRespondentPhone] = useState('');
  const [locationName, setLocationName] = useState(
    user?.department || 'District Center'
  );
  const [hasConsent, setHasConsent] = useState(true);

  // Question answers map: questionId -> value
  const [answers, setAnswers] = useState<
    Record<string, string | number | boolean | string[]>
  >({});

  // Media answers map: questionId -> QuestionMediaAnswer
  const [mediaAnswers, setMediaAnswers] = useState<
    Record<string, QuestionMediaAnswer>
  >({});

  // ── Live Voice Recording State ──
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Playback State for recorded audio ──
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Hidden native inputs
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Live Camera (Photo & Video) Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraModalMode, setCameraModalMode] = useState<'photo' | 'video'>(
    'photo'
  );

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const totalSteps = questions.length + 1; // 0 is respondent details, 1..N are questions
  const currentQuestion: SurveyQuestion | undefined =
    currentStep > 0 && currentStep <= questions.length
      ? questions[currentStep - 1]
      : undefined;

  const currentQId = currentQuestion?.id || '';

  // ── Media Handlers ──
  const startVoiceRecording = async () => {
    if (!currentQId) return;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });
          const url = URL.createObjectURL(audioBlob);
          const duration = recordingSeconds || 6;
          setMediaAnswers(prev => ({
            ...prev,
            [currentQId]: {
              ...(prev[currentQId] || {}),
              voiceUrl: url,
              voiceName: `voice_${currentQId}_${Date.now()}.webm`,
              voiceDuration: duration,
            },
          }));
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecordingVoice(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      } else {
        // Fallback demo recording
        setIsRecordingVoice(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      }
    } catch {
      toast.error(
        'Microphone access blocked. Please upload an audio file instead.'
      );
      audioInputRef.current?.click();
    }
  };

  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    } else if (currentQId) {
      // Demo recording fallback
      setMediaAnswers(prev => ({
        ...prev,
        [currentQId]: {
          ...(prev[currentQId] || {}),
          voiceUrl: '#demo-voice',
          voiceName: `voice_note_${currentQId}.wav`,
          voiceDuration: recordingSeconds || 5,
        },
      }));
    }
    setIsRecordingVoice(false);
  };

  const handleAudioUpload = (file: File) => {
    if (!currentQId) return;
    const url = URL.createObjectURL(file);
    setMediaAnswers(prev => ({
      ...prev,
      [currentQId]: {
        ...(prev[currentQId] || {}),
        voiceUrl: url,
        voiceName: file.name,
        voiceDuration: 12,
      },
    }));
  };

  const handleVideoUpload = (file: File) => {
    if (!currentQId) return;
    const url = URL.createObjectURL(file);
    setMediaAnswers(prev => ({
      ...prev,
      [currentQId]: {
        ...(prev[currentQId] || {}),
        videoUrl: url,
        videoName: file.name,
      },
    }));
  };

  const handleImageUpload = (file: File) => {
    if (!currentQId) return;
    const url = URL.createObjectURL(file);
    setMediaAnswers(prev => ({
      ...prev,
      [currentQId]: {
        ...(prev[currentQId] || {}),
        imageUrl: url,
        imageName: file.name,
      },
    }));
  };

  const handleCameraCapture = (result: CapturedMediaResult) => {
    if (!currentQId) return;
    if (cameraModalMode === 'photo') {
      setMediaAnswers(prev => ({
        ...prev,
        [currentQId]: {
          ...(prev[currentQId] || {}),
          imageUrl: result.previewUrl,
          imageName: result.fileName,
        },
      }));
      toast.success('Live photo captured and attached.');
    } else {
      setMediaAnswers(prev => ({
        ...prev,
        [currentQId]: {
          ...(prev[currentQId] || {}),
          videoUrl: result.previewUrl,
          videoName: result.fileName,
        },
      }));
      toast.success('Live video recorded and attached.');
    }
  };

  const removeMedia = (type: 'voice' | 'video' | 'image') => {
    if (!currentQId) return;
    setMediaAnswers(prev => {
      const copy = { ...(prev[currentQId] || {}) };
      if (type === 'voice') {
        delete copy.voiceUrl;
        delete copy.voiceName;
        delete copy.voiceDuration;
      }
      if (type === 'video') {
        delete copy.videoUrl;
        delete copy.videoName;
      }
      if (type === 'image') {
        delete copy.imageUrl;
        delete copy.imageName;
      }
      return { ...prev, [currentQId]: copy };
    });
  };

  const toggleAudioPlayback = (url?: string) => {
    if (!url) return;
    if (playingAudioKey === url) {
      playbackAudioRef.current?.pause();
      setPlayingAudioKey(null);
      return;
    }

    if (url === '#demo-voice') {
      setPlayingAudioKey(url);
      const synth = window.speechSynthesis;
      if (synth) {
        const utter = new SpeechSynthesisUtterance(
          'Playing recorded voice note response.'
        );
        utter.onend = () => setPlayingAudioKey(null);
        utter.onerror = () => setPlayingAudioKey(null);
        synth.speak(utter);
      } else {
        setTimeout(() => setPlayingAudioKey(null), 3000);
      }
      return;
    }

    if (playbackAudioRef.current) {
      playbackAudioRef.current.src = url;
      playbackAudioRef.current.play().catch(() => setPlayingAudioKey(null));
      setPlayingAudioKey(url);
      playbackAudioRef.current.onended = () => setPlayingAudioKey(null);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Submit Survey Response ──
  const handleSubmitSurvey = () => {
    try {
      SurveyStore.submitResponse(survey.id, {
        respondentName: respondentName.trim() || 'Anonymous Respondent',
        respondentPhone: respondentPhone.trim() || undefined,
        location: locationName.trim(),
        answers,
        media: mediaAnswers,
        submittedBy: {
          name: user?.name || 'Surveyor',
          role: user?.role || 'Intern',
        },
      });

      toast.success('Survey response & evidence submitted successfully!');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed submitting survey response'
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Hidden Audio Player for playback */}
      <audio ref={playbackAudioRef} className="hidden" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {survey.projectName || 'Field Survey Questionnaire'}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {survey.title}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X size={18} weight="bold" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 shrink-0">
        <div
          className="bg-blue-600 h-1.5 transition-all duration-300"
          style={{
            width: `${Math.round(((currentStep + 1) / (totalSteps + 1)) * 100)}%`,
          }}
        />
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
        {/* Step 0: Respondent & Location Details */}
        {currentStep === 0 && (
          <div className="space-y-4 max-w-lg mx-auto py-2">
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Respondent & Field Context
              </h3>
              <p className="text-xs text-slate-500">
                Record the participant details before starting the
                question-by-question interview.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Respondent Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra / Head of Household"
                  value={respondentName}
                  onChange={e => setRespondentName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={respondentPhone}
                  onChange={e => setRespondentPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Location / Village / Block
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={e => setHasConsent(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>
                I confirm that the respondent was informed about the purpose of
                this survey and has given free and informed consent for data &
                media collection.
              </span>
            </label>
          </div>
        )}

        {/* Step 1..N: Individual Questions with Evidence Recording */}
        {currentQuestion && (
          <div className="space-y-5 max-w-xl mx-auto py-2">
            {/* Question Header */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>
                  Question {currentStep} of {questions.length}
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                  {currentQuestion.type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestion.question || `Survey Question ${currentStep}`}
              </h3>
            </div>

            {/* Answer Controls Based on Question Type */}
            <div className="space-y-3">
              {/* 1. Single Choice (Radio) */}
              {currentQuestion.type === 'single_choice' && (
                <div className="space-y-2">
                  {(currentQuestion.options || ['Yes', 'No', 'Neutral']).map(
                    (opt, oIdx) => {
                      const isSelected = answers[currentQId] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            setAnswers(prev => ({ ...prev, [currentQId]: opt }))
                          }
                          className={cn(
                            'w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between',
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <span>{opt}</span>
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border flex items-center justify-center',
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300'
                            )}
                          >
                            {isSelected && <Check size={10} weight="bold" />}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {/* 2. Multiple Choice (Checkboxes) */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(
                    currentQuestion.options || [
                      'Option 1',
                      'Option 2',
                      'Option 3',
                    ]
                  ).map((opt, oIdx) => {
                    const currentSelected: string[] = Array.isArray(
                      answers[currentQId]
                    )
                      ? (answers[currentQId] as string[])
                      : [];
                    const isChecked = currentSelected.includes(opt);
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          setAnswers(prev => {
                            const list: string[] = Array.isArray(
                              prev[currentQId]
                            )
                              ? (prev[currentQId] as string[])
                              : [];
                            const next = isChecked
                              ? list.filter(x => x !== opt)
                              : [...list, opt];
                            return { ...prev, [currentQId]: next };
                          });
                        }}
                        className={cn(
                          'w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between',
                          isChecked
                            ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <span>{opt}</span>
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center',
                            isChecked
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300'
                          )}
                        >
                          {isChecked && <Check size={10} weight="bold" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Likert Scale (5-Point) */}
              {currentQuestion.type === 'likert_scale' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {(
                      currentQuestion.likertConfig?.labels || [
                        'Very Dissatisfied',
                        'Dissatisfied',
                        'Neutral',
                        'Satisfied',
                        'Very Satisfied',
                      ]
                    ).map((label, idx) => {
                      const point = idx + 1;
                      const isSelected = answers[currentQId] === point;
                      return (
                        <button
                          key={point}
                          type="button"
                          onClick={() =>
                            setAnswers(prev => ({
                              ...prev,
                              [currentQId]: point,
                            }))
                          }
                          className={cn(
                            'p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1',
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-base font-bold">{point}</span>
                          <span className="text-[10px] leading-tight line-clamp-2">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Dichotomous (Yes / No) */}
              {currentQuestion.type === 'dichotomous' && (
                <div className="grid grid-cols-2 gap-3">
                  {(currentQuestion.dichotomousLabels || ['Yes', 'No']).map(
                    (opt, oIdx) => {
                      const isSelected = answers[currentQId] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            setAnswers(prev => ({ ...prev, [currentQId]: opt }))
                          }
                          className={cn(
                            'p-4 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer',
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {opt}
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              {/* 5. Descriptive Response (Textarea) */}
              {currentQuestion.type === 'descriptive' && (
                <textarea
                  rows={4}
                  placeholder={
                    currentQuestion.placeholder ||
                    'Type respondent observation or detailed notes...'
                  }
                  value={
                    typeof answers[currentQId] === 'string'
                      ? (answers[currentQId] as string)
                      : ''
                  }
                  onChange={e =>
                    setAnswers(prev => ({
                      ...prev,
                      [currentQId]: e.target.value,
                    }))
                  }
                  className="w-full p-3.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                />
              )}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                PARTICIPANT EVIDENCE RECORDING (VOICE NOTE, VIDEO, CLICK PICTURE)
               ════════════════════════════════════════════════════════════════ */}
            {(currentQuestion.allowVoice ||
              currentQuestion.allowVideo ||
              currentQuestion.allowImage) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkle
                      size={15}
                      className="text-blue-600"
                      weight="fill"
                    />
                    Field Verification & Evidence
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Required/Allowed for this question
                  </span>
                </div>

                {/* Hidden inputs for real file selection / camera capture */}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleAudioUpload(f);
                  }}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleVideoUpload(f);
                  }}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Voice Note Recording Option */}
                  {currentQuestion.allowVoice && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Microphone
                            size={15}
                            weight="bold"
                            className="text-blue-600"
                          />
                          Voice Note
                        </span>
                        {mediaAnswers[currentQId]?.voiceUrl && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Attached ✓
                          </span>
                        )}
                      </div>

                      {mediaAnswers[currentQId]?.voiceUrl ? (
                        <div className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs">
                          <button
                            type="button"
                            onClick={() =>
                              toggleAudioPlayback(
                                mediaAnswers[currentQId]?.voiceUrl
                              )
                            }
                            className="flex items-center gap-1.5 text-blue-700 font-semibold truncate hover:underline cursor-pointer"
                          >
                            <Play size={12} weight="fill" />
                            <span className="truncate text-[11px]">
                              {mediaAnswers[currentQId]?.voiceName ||
                                'voice_recording'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMedia('voice')}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                            title="Delete voice note"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      ) : isRecordingVoice ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                            <span className="font-bold">
                              {formatSeconds(recordingSeconds)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={stopVoiceRecording}
                            className="px-2 py-1 rounded-md bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Stop size={11} weight="fill" />
                            <span>Stop</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Microphone size={13} weight="bold" />
                            <span>Record</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => audioInputRef.current?.click()}
                            className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition-colors cursor-pointer"
                            title="Upload audio"
                          >
                            <UploadSimple size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Video Note Recording Option */}
                  {currentQuestion.allowVideo && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <VideoCamera
                            size={15}
                            weight="bold"
                            className="text-sky-600"
                          />
                          Record Video
                        </span>
                        {mediaAnswers[currentQId]?.videoUrl && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Attached ✓
                          </span>
                        )}
                      </div>

                      {mediaAnswers[currentQId]?.videoUrl ? (
                        <div className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs">
                          <span className="truncate text-[11px] font-semibold text-sky-800">
                            {mediaAnswers[currentQId]?.videoName ||
                              'video_clip.mp4'}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeMedia('video')}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                            title="Delete video"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCameraModalMode('video');
                              setCameraModalOpen(true);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Record live video clip with system camera"
                          >
                            <VideoCamera size={13} weight="bold" />
                            <span>Record</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition-colors cursor-pointer"
                            title="Upload video from gallery or files"
                          >
                            <UploadSimple size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Click Picture / Photo Option */}
                  {currentQuestion.allowImage && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Camera
                            size={15}
                            weight="bold"
                            className="text-emerald-600"
                          />
                          Click Picture
                        </span>
                        {mediaAnswers[currentQId]?.imageUrl && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Attached ✓
                          </span>
                        )}
                      </div>

                      {mediaAnswers[currentQId]?.imageUrl ? (
                        <div className="flex items-center justify-between gap-1.5 p-2 rounded-lg bg-white border border-slate-200 text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <img
                              src={mediaAnswers[currentQId]?.imageUrl}
                              alt="Evidence thumbnail"
                              className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                            />
                            <span className="truncate text-[11px] font-semibold text-emerald-800">
                              {mediaAnswers[currentQId]?.imageName ||
                                'photo_evidence.jpg'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMedia('image')}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                            title="Delete picture"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCameraModalMode('photo');
                              setCameraModalOpen(true);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Capture live photo with system camera"
                          >
                            <Camera size={13} weight="bold" />
                            <span>Capture</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition-colors cursor-pointer"
                            title="Upload photo from gallery or files"
                          >
                            <UploadSimple size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Step: Review & Confirm Submission */}
        {currentStep > questions.length && (
          <div className="space-y-4 max-w-lg mx-auto py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle size={32} weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Ready to Submit Response
            </h3>
            <p className="text-xs text-slate-500">
              You have completed all {questions.length} questions for{' '}
              <strong className="text-slate-700">
                {respondentName || 'this respondent'}
              </strong>
              .
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Respondent:</span>
                <span className="font-semibold text-slate-800">
                  {respondentName || 'Anonymous'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">
                  {locationName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Total Questions Answered:
                </span>
                <span className="font-semibold text-blue-600">
                  {Object.keys(answers).length} / {questions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evidence Media Captured:</span>
                <span className="font-semibold text-emerald-600">
                  {Object.keys(mediaAnswers).length} questions with media
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (currentStep === 0) {
              if (onClose) onClose();
            } else {
              setCurrentStep(s => Math.max(0, s - 1));
            }
          }}
          className="px-4 py-2 text-xs sm:text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
        </button>

        {currentStep <= questions.length ? (
          <button
            type="button"
            onClick={() => {
              if (currentStep === 0 && !respondentName.trim()) {
                toast.warning(
                  'Please enter the respondent name before proceeding.'
                );
                return;
              }
              setCurrentStep(s => s + 1);
            }}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              {currentStep === questions.length
                ? 'Review & Submit'
                : 'Next Question'}
            </span>
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitSurvey}
            className="px-6 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Confirm & Submit</span>
          </button>
        )}
      </div>

      <MediaCaptureModal
        isOpen={cameraModalOpen}
        mode={cameraModalMode}
        title={
          cameraModalMode === 'photo'
            ? `Capture Photo — ${currentQuestion?.question || 'Survey Question'}`
            : `Record Video — ${currentQuestion?.question || 'Survey Question'}`
        }
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onFallbackUpload={() => {
          if (cameraModalMode === 'photo') {
            imageInputRef.current?.click();
          } else {
            videoInputRef.current?.click();
          }
        }}
      />
    </div>
  );
}
