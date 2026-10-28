import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  Video,
  Square,
  RefreshCw,
  Check,
  X,
  Upload,
  AlertCircle,
  Play,
  RotateCcw,
  Loader2,
} from 'lucide-react';

export interface CapturedMediaResult {
  file: File;
  previewUrl: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  duration?: number;
}

interface MediaCaptureModalProps {
  isOpen: boolean;
  mode: 'photo' | 'video';
  title?: string;
  onClose: () => void;
  onCapture: (result: CapturedMediaResult) => void;
  onFallbackUpload?: () => void;
}

export default function MediaCaptureModal({
  isOpen,
  mode,
  title,
  onClose,
  onCapture,
  onFallbackUpload,
}: MediaCaptureModalProps): React.ReactElement | null {
  // Determine if device is a mobile device with back camera preference
  const isMobile =
    typeof window !== 'undefined' &&
    (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024));

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    isMobile ? 'environment' : 'user'
  );
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Photo state
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedPhotoBlob, setCapturedPhotoBlob] = useState<Blob | null>(null);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);

  // Refs
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop all active tracks without triggering re-render cascades
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore track stop error
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
  }, []);

  // Check available cameras
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices
      ?.enumerateDevices?.()
      .then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      })
      .catch(() => {
        setHasMultipleCameras(false);
      });
  }, [isOpen]);

  // Start media stream with progressive fallback
  const startCamera = useCallback(
    async (targetFacing: 'user' | 'environment') => {
      stopStream();
      setPermissionError(null);
      setIsVideoReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionError('Camera access is not supported by your browser.');
        return;
      }

      let mediaStream: MediaStream;

      // 1. Try with preferred facingMode and resolution
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: mode === 'video',
        });
      } catch {
        // 2. Fallback without facingMode constraint (essential for Mac Safari and webcams)
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: mode === 'video',
          });
        } catch (err) {
          const errorMsg =
            err instanceof Error
              ? err.message
              : 'Unable to access camera or microphone.';
          setPermissionError(errorMsg);
          return;
        }
      }

      if (!mediaStream) return;
      streamRef.current = mediaStream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;

        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => setIsVideoReady(true))
            .catch(() => setIsVideoReady(true));
        };

        video.onloadeddata = () => {
          setIsVideoReady(true);
        };
      }
    },
    [mode, stopStream]
  );

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      setCapturedPhotoBlob(null);
      setRecordedVideoUrl(null);
      setRecordedVideoBlob(null);
      setIsRecording(false);
      setRecordingSeconds(0);
      startCamera(facingMode);
    } else {
      stopStream();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      stopStream();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // Only re-run when modal opens or closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Flip camera
  const handleToggleCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isOpen && !capturedPhotoUrl && !recordedVideoUrl) {
      startCamera(nextFacing);
    }
  };

  // Capture Photo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedPhotoBlob(blob);
          setCapturedPhotoUrl(url);
          stopStream();
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handleRetakePhoto = () => {
    setCapturedPhotoBlob(null);
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
      setCapturedPhotoUrl(null);
    }
    startCamera(facingMode);
  };

  const handleConfirmPhoto = () => {
    if (!capturedPhotoBlob || !capturedPhotoUrl) return;

    const timestamp = Date.now();
    const fileName = `field_camera_photo_${timestamp}.jpg`;
    const file = new File([capturedPhotoBlob], fileName, {
      type: 'image/jpeg',
    });
    const sizeKB = Math.round(capturedPhotoBlob.size / 1024);
    const sizeStr =
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    onCapture({
      file,
      previewUrl: capturedPhotoUrl,
      fileName,
      fileSize: sizeStr,
      mimeType: 'image/jpeg',
    });
    onClose();
  };

  // Video Recording Handlers
  const handleStartRecording = () => {
    if (!streamRef.current) return;
    videoChunksRef.current = [];

    // Detect supported mimeType
    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    }

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) {
        videoChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedVideoBlob(blob);
      setRecordedVideoUrl(url);
      stopStream();
    };

    recorder.start(500); // 500ms chunks
    setIsRecording(true);
    setRecordingSeconds(0);

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds(sec => sec + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleRetakeVideo = () => {
    setRecordedVideoBlob(null);
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordingSeconds(0);
    startCamera(facingMode);
  };

  const handleConfirmVideo = () => {
    if (!recordedVideoBlob || !recordedVideoUrl) return;

    const timestamp = Date.now();
    const ext = recordedVideoBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const fileName = `field_video_${timestamp}.${ext}`;
    const file = new File([recordedVideoBlob], fileName, {
      type: recordedVideoBlob.type,
    });
    const sizeKB = Math.round(recordedVideoBlob.size / 1024);
    const sizeStr =
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    onCapture({
      file,
      previewUrl: recordedVideoUrl,
      fileName,
      fileSize: sizeStr,
      mimeType: recordedVideoBlob.type,
      duration: recordingSeconds,
    });
    onClose();
  };

  // Internal Gallery Selection Handler
  const handleGalleryClick = () => {
    if (onFallbackUpload) {
      onClose();
      onFallbackUpload();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (mode === 'photo') {
      setCapturedPhotoBlob(file);
      setCapturedPhotoUrl(url);
      stopStream();
    } else {
      setRecordedVideoBlob(file);
      setRecordedVideoUrl(url);
      stopStream();
    }
    e.target.value = '';
  };

  if (!isOpen) return null;

  const defaultTitle =
    mode === 'photo'
      ? 'Live Camera — Capture Photo'
      : 'Live Camera — Record Video';

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget && !isRecording) onClose();
      }}
    >
      {/* Hidden File Input for Direct Gallery Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept={mode === 'photo' ? 'image/*' : 'video/*'}
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              {mode === 'photo' ? (
                <Camera className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {title || defaultTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'photo'
                  ? 'Take field photo with camera or choose from gallery'
                  : 'Record live video evidence with audio feed'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMultipleCameras && !capturedPhotoUrl && !recordedVideoUrl && (
              <button
                type="button"
                onClick={handleToggleCamera}
                title="Switch Camera (Front/Rear)"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isRecording}
              className="p-1.5 rounded-lg bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] sm:min-h-[360px] max-h-[500px] overflow-hidden select-none">
          {/* Flash Shutter Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
          )}

          {permissionError ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {permissionError}
              </p>
              <button
                type="button"
                onClick={handleGalleryClick}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Photo from Gallery / Files Instead</span>
              </button>
            </div>
          ) : capturedPhotoUrl ? (
            /* Captured Photo Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-black min-h-[320px]">
              <img
                src={capturedPhotoUrl}
                alt="Captured field photo"
                className="max-h-[380px] w-auto max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Ready</span>
              </div>
            </div>
          ) : recordedVideoUrl ? (
            /* Recorded Video Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-black min-h-[320px]">
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[380px] w-auto max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                <Play className="w-3.5 h-3.5" />
                <span>Video Ready ({formatSeconds(recordingSeconds)})</span>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center min-h-[320px]">
              {/* Spinner while video is connecting */}
              {!isVideoReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-slate-400 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs">Starting camera feed...</span>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full min-h-[320px] max-h-[380px] object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Live Status Indicator */}
              {isVideoReady && (
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-[10px] text-emerald-400 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Camera Active</span>
                </div>
              )}

              {/* Grid Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none border border-white/10 grid grid-cols-3 grid-rows-3 opacity-30">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC {formatSeconds(recordingSeconds)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          {capturedPhotoUrl ? (
            /* Controls after Photo Captured */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetakePhoto}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-emerald-900/40"
              >
                <Check className="w-4 h-4" />
                <span>Attach This Photo</span>
              </button>
            </div>
          ) : recordedVideoUrl ? (
            /* Controls after Video Recorded */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetakeVideo}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmVideo}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-emerald-900/40"
              >
                <Check className="w-4 h-4" />
                <span>Attach This Video</span>
              </button>
            </div>
          ) : (
            /* Live Camera Controls */
            <div className="flex items-center justify-between w-full gap-3">
              {/* Gallery upload fallback button is always available */}
              <button
                type="button"
                onClick={handleGalleryClick}
                disabled={isRecording}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Choose Gallery</span>
              </button>

              {mode === 'photo' ? (
                /* Big shutter button for photo */
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={!isVideoReady || !!permissionError}
                  className="relative group p-1 rounded-full bg-white/20 hover:bg-white/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mx-auto"
                  title="Capture Photo"
                >
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xl group-hover:scale-105 transition-transform active:scale-95">
                    <Camera className="w-6 h-6 text-slate-800" />
                  </div>
                </button>
              ) : isRecording ? (
                /* Stop Recording button */
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer animate-pulse mx-auto"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>
                    Stop Recording ({formatSeconds(recordingSeconds)})
                  </span>
                </button>
              ) : (
                /* Start Recording button */
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={!isVideoReady || !!permissionError}
                  className="relative group p-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mx-auto"
                  title="Start Recording Video"
                >
                  <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform active:scale-95">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </button>
              )}

              <div className="w-24 text-right">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isRecording}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
