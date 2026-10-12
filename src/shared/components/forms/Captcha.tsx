import React, { useState, useEffect } from 'react';
import { InputBlock } from './InputBlock';
import { RefreshCw } from 'lucide-react';

export interface CaptchaProps {
  id?: string;
  label?: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  errorMessage?: string;
  required?: boolean;
}

export const Captcha: React.FC<CaptchaProps> = ({
  id,
  label = 'Security Code',
  onChange,
  errorMessage,
  required = true,
}) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    onChange('');
  };

  useEffect(() => {
    generateCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (val: string) => {
    setUserInput(val);
    onChange(val);
  };

  return (
    <InputBlock
      id={id}
      label={label}
      required={required}
      errorMessage={errorMessage}
    >
      <div className="flex items-center gap-1.5">
        {/* Visual Captcha Code Box */}
        <div className="px-3.5 py-2 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono tracking-widest text-base font-semibold select-none flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 shadow-xs">
          <span className="transform -rotate-1 text-primary font-bold">
            {captchaCode}
          </span>
        </div>

        {/* Standalone Refresh Icon Button (Tight Spacing) */}
        <button
          type="button"
          onClick={generateCaptcha}
          className="h-10 w-6 shrink-0 flex items-center justify-center bg-transparent border-none text-slate-500 dark:text-slate-400 hover:text-primary transition-colors duration-150 cursor-pointer p-0"
          title="Refresh Captcha"
        >
          <RefreshCw className="w-4.5 h-4.5 stroke-2" />
        </button>

        {/* Input Field */}
        <input
          type="text"
          value={userInput}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="Enter code"
          className="flex-1 min-w-0 h-10 px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase tracking-wider transition-colors duration-150 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 border-slate-300 dark:border-slate-700 hover:border-slate-400 focus:border-primary focus:ring-primary/20"
        />
      </div>
    </InputBlock>
  );
};
