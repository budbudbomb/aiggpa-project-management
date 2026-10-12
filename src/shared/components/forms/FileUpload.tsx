import React, { useState, useRef } from 'react';
import { InputBlock } from './InputBlock';
import { UploadCloud, File, X } from 'lucide-react';

export interface FileUploadProps {
  id?: string;
  label?: string;
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  onChange,
  accept = '*/*',
  multiple = false,
  maxSizeMB = 5,
  errorMessage,
  helperText,
  required = false,
  className = '',
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (file.size <= maxSizeMB * 1024 * 1024) {
        validFiles.push(file);
      }
    });

    const updated = multiple ? [...selectedFiles, ...validFiles] : validFiles;
    setSelectedFiles(updated);
    onChange(updated);
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onChange(updated);
  };

  return (
    <InputBlock
      id={id}
      label={label}
      required={required}
      errorMessage={errorMessage}
      helperText={helperText}
      className={className}
    >
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="p-3 rounded-full bg-primary/10 dark:bg-slate-800 text-primary dark:text-primary">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Click to upload or drag & drop
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supports files up to {maxSizeMB}MB ({accept})
          </span>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <File className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {file.name}
                </span>
                <span className="text-slate-400">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </InputBlock>
  );
};
