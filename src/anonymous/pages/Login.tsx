import React, { useEffect, useState } from 'react';
import { Button } from 'shared/components/buttons';
import {
  Captcha,
  PasswordBox,
  TextBox,
  Checkbox,
} from 'shared/components/forms';
import { useLoginForm } from './login.hook';
import {
  AlertCircle,
  X,
  LogIn,
  User,
  ShieldCheck,
  Languages,
  LayoutTemplate,
} from 'lucide-react';
import './Login.css';

export interface LoginProps {
  onForgotPassword?: () => void;
}

export default function Login({ onForgotPassword }: LoginProps) {
  const [isHiding, setIsHiding] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [selectedLayout, setSelectedLayout] = useState<1 | 2>(1);

  const {
    formData,
    handleInputChange,
    handleSubmit,
    isLoading,
    formError,
    setFormError,
    regenerateCaptcha,
    quickLogin,
  } = useLoginForm();

  useEffect(() => {
    if (formError) {
      setIsHiding(false);
      const timer = setTimeout(() => {
        setIsHiding(true);
        setTimeout(() => setFormError(undefined), 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [formError, setFormError]);

  const handleCloseError = () => {
    setIsHiding(true);
    setTimeout(() => setFormError(undefined), 300);
  };

  // Language Dictionary
  const t = {
    en: {
      govtTag: 'Government of Madhya Pradesh',
      titleP1: 'Atal Bihari Vajpayee',
      titleHighlight: 'Institute of Good Governance',
      titleP2: 'and Policy Analysis',
      titleAbbr: '(AIGGPA)',
      subtext1: '(A registered body of',
      subtextGovt: 'Government of Madhya Pradesh',
      subtext2: 'under',
      subtextDept: 'Public Service Management Department',
      subtext3: ')',
      singleSignOn: 'Single Sign-On • Secure ERP Portal',
      loginHeader: 'ERP LOGIN',
      loginSub: 'Enter your ERP credentials to access your account',
      userNameLabel: 'Username / User ID',
      userNamePlaceholder: 'Enter your username or user ID',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      captchaLabel: 'Security Verification Code',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signInBtn: 'Sign In',
      copyright:
        '© 2026 Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis (AIGGPA)',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      help: 'Help & Support',
    },
    hi: {
      govtTag: 'मध्य प्रदेश शासन',
      titleP1: 'अटल बिहारी वाजपेयी',
      titleHighlight: 'सुशासन एवं नीति विश्लेषण संस्थान',
      titleP2: '',
      titleAbbr: '(एआईजीजीपीए)',
      subtext1: '(',
      subtextGovt: 'मध्य प्रदेश शासन',
      subtext2: 'के लोक सेवा प्रबंधन विभाग के अंतर्गत पंजीकृत संस्थान',
      subtextDept: '',
      subtext3: ')',
      singleSignOn: 'सिंगल साइन-ऑन • सुरक्षित ईआरपी पोर्टल',
      loginHeader: 'ईआरपी लॉगिन',
      loginSub: 'अपने ईआरपी खाते में प्रवेश के लिए क्रेडेंशियल दर्ज करें',
      userNameLabel: 'उपयोगकर्ता नाम / यूज़र आईडी',
      userNamePlaceholder: 'अपना उपयोगकर्ता नाम या यूज़र आईडी दर्ज करें',
      passwordLabel: 'पासवर्ड',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      captchaLabel: 'सुरक्षा कोड (कैप्चा)',
      rememberMe: 'मुझे याद रखें',
      forgotPassword: 'पासवर्ड भूल गए?',
      signInBtn: 'साइन इन करें',
      copyright:
        '© 2026 अटल बिहारी वाजपेयी सुशासन एवं नीति विश्लेषण संस्थान (एआईजीजीपीए)',
      privacy: 'गोपनीयता नीति',
      terms: 'सेवा की शर्तें',
      help: 'सहायता एवं समर्थन',
    },
  }[lang];

  // Render left side based on active selected layout
  const renderLeftSideContent = () => {
    switch (selectedLayout) {
      case 1:
        // LAYOUT 1: Classic Official Government Portal
        return (
          <div className="hidden lg:flex lg:w-7/12 w-full flex-col justify-center text-slate-900 dark:text-white max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-3 flex items-center justify-center border border-blue-200/80 shadow-md backdrop-blur-md">
                <img
                  src="/MP_LOGO.png"
                  alt="Government of MP Emblem Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-3 flex items-center justify-center border border-blue-200/80 shadow-md backdrop-blur-md">
                <img
                  src="/Aiggpa_Logo.svg"
                  alt="AIGGPA Department Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 bg-blue-50/95 dark:bg-blue-950/90 px-3.5 py-1.5 rounded-md border border-blue-300 dark:border-blue-800 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                {t.govtTag}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight leading-tight text-slate-900 dark:text-white">
                <span className="block">{t.titleP1}</span>
                <span className="block text-blue-600 dark:text-blue-400">
                  {t.titleHighlight}
                </span>
                <span className="block">
                  {t.titleP2}{' '}
                  <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">
                    {t.titleAbbr}
                  </span>
                </span>
              </h1>

              <div className="mt-5 p-4 sm:p-5 rounded-r-xl rounded-l-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l-4 border-l-blue-600 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {t.subtext1}{' '}
                  <strong className="text-blue-900 dark:text-blue-300 font-bold">
                    {t.subtextGovt}
                  </strong>{' '}
                  {t.subtext2}{' '}
                  {t.subtextDept && (
                    <strong className="text-blue-900 dark:text-blue-300 font-bold">
                      {t.subtextDept}
                    </strong>
                  )}
                  {t.subtext3}
                </p>
              </div>
            </div>

            <div className="mt-8 text-sm flex items-center gap-2.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{t.singleSignOn}</span>
            </div>
          </div>
        );

      case 2:
        // LAYOUT 2: Standalone Infographic Image (Without background - Larger Size)
        return (
          <div className="hidden lg:flex lg:w-7/12 xl:w-2/3 w-full flex-col justify-center items-center max-w-3xl xl:max-w-4xl">
            <img
              src="/Login_infographic.png"
              alt="AIGGPA ERP Infographic"
              className="w-full h-auto max-h-[92vh] xl:max-h-[95vh] object-contain drop-shadow-2xl scale-105 transition-transform duration-300"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`aiggpa-login-bg-page ${lang === 'hi' ? 'lang-hi' : ''}`}>
      {/* Ambient CSS Light Glow Orbs */}
      <div className="aiggpa-login-glow-orb-1" />
      <div className="aiggpa-login-glow-orb-2" />

      {/* TOP LEFT MOBILE BRANDING (Dual Logos: MP Emblem + AIGGPA Logo) */}
      <div className="fixed top-3 left-3 lg:hidden z-40 flex items-center gap-2">
        <img
          src="/MP_LOGO.png"
          alt="Government of MP Emblem Logo"
          className="w-7 h-7 object-contain shrink-0"
        />
        <img
          src="/Aiggpa_Logo.svg"
          alt="AIGGPA Department Logo"
          className="w-7 h-7 object-contain shrink-0"
        />
        <div className="flex flex-col text-left leading-none">
          <span className="text-[11px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            AIGGPA ERP
          </span>
          <span className="text-[9px] font-bold text-blue-700 dark:text-blue-400 mt-0.5">
            {lang === 'en' ? 'Govt. of Madhya Pradesh' : 'मध्य प्रदेश शासन'}
          </span>
        </div>
      </div>

      {/* TOP RIGHT CONTROLS: DIRECT LAYOUT TOGGLE + LANGUAGE TOGGLE */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 flex items-center gap-2">
        {/* DIRECT LAYOUT TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setSelectedLayout(prev => (prev === 1 ? 2 : 1))}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 shadow-md backdrop-blur-md transition-all cursor-pointer"
          title="Toggle Layout / लेआउट बदलें"
        >
          <LayoutTemplate className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            {lang === 'en'
              ? selectedLayout === 1
                ? 'Infographic View'
                : 'Official View'
              : selectedLayout === 1
                ? 'इंफोग्राफिक व्यू'
                : 'ऑफिशियल व्यू'}
          </span>
        </button>

        {/* LANGUAGE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setLang(prev => (prev === 'en' ? 'hi' : 'en'))}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 shadow-md backdrop-blur-md transition-all cursor-pointer"
          title="Switch Language / भाषा बदलें"
        >
          <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      {/* Toast Notification */}
      {formError && (
        <div
          className={`login-toast-error ${isHiding ? 'opacity-0 scale-95' : ''}`}
        >
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{formError}</span>
          <button
            onClick={handleCloseError}
            className="ml-auto text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 transition-colors p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Composite Layout Container */}
      <main className="w-full max-w-350 mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-12 relative z-10 my-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* DYNAMIC LEFT SIDE CONTENT (Selected from 5 Layouts) */}
        {renderLeftSideContent()}

        {/* RIGHT SIDE: Mobile Optimized Royal Blue Form Card (lg:w-1/2) */}
        <div className="lg:w-1/2 w-full flex justify-center lg:justify-end items-center">
          <div className="aiggpa-form-card">
            {/* Card Header */}
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              {/* Security Shield Check Badge Icon (Blue Theme) */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 dark:bg-blue-950/90 border border-blue-200/90 dark:border-blue-800 flex items-center justify-center shadow-md shadow-blue-600/10 mb-2 sm:mb-3">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.loginHeader}
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                {t.loginSub}
              </p>
            </div>

            {/* Form Controls */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3.5 sm:gap-4"
            >
              <TextBox
                label={t.userNameLabel}
                placeholder={t.userNamePlaceholder}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                value={formData.userName}
                onChange={e => handleInputChange('userName', e.target.value)}
                required
              />

              <PasswordBox
                label={t.passwordLabel}
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                required
              />

              <Captcha
                label={t.captchaLabel}
                onChange={val => handleInputChange('captcha', val)}
                onRefresh={regenerateCaptcha}
              />

              <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
                <Checkbox
                  id="remember-me"
                  label={t.rememberMe}
                  checked={rememberMe}
                  onChange={checked => setRememberMe(checked)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onForgotPassword) {
                      onForgotPassword();
                    } else {
                      alert('Password reset procedure initialized.');
                    }
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 shrink-0 ml-2"
                >
                  {t.forgotPassword}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<LogIn className="w-4 h-4" />}
                isLoading={isLoading}
                className="w-full mt-1 sm:mt-2 cursor-pointer py-2.5 sm:py-3 text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t.signInBtn}
              </Button>

              {/* Quick Demo Role Selector */}
              <div className="pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Hierarchy Test Profiles (Prototype)
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    1-Click Direct Login
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5">
                  {[
                    {
                      id: 'EMP-CH-01',
                      role: 'Center Head',
                      name: 'Dr. Rajeshwar Rao',
                      badge: 'Tier 1 • Center Head',
                      badgeColor:
                        'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                      icon: '👑',
                    },
                    {
                      id: 'EMP-PM-01',
                      role: 'Project Manager',
                      name: 'Priya Sharma',
                      badge: 'Tier 2 • PM',
                      badgeColor:
                        'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200 dark:border-sky-800',
                      icon: '💼',
                    },
                    {
                      id: 'EMP-RA-01',
                      role: 'Research Analyst',
                      name: 'Dr. Vikramaditya',
                      badge: 'Tier 2 • RA',
                      badgeColor:
                        'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800',
                      icon: '🔬',
                    },
                    {
                      id: 'EMP-FL-01',
                      role: 'Fellow',
                      name: 'Aakash Mehta',
                      badge: 'Tier 3 • Fellow',
                      badgeColor:
                        'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                      icon: '🎓',
                    },
                    {
                      id: 'EMP-IN-01',
                      role: 'Intern',
                      name: 'Rohan Verma',
                      badge: 'Tier 4 • Intern',
                      badgeColor:
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                      icon: '📋',
                    },
                  ].map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => quickLogin(acc.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{acc.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {acc.name}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${acc.badgeColor}`}
                            >
                              {acc.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            ID: {acc.id}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex items-center shrink-0 ml-1">
                        Sign In →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 2-Side Screen Bottom Footer (Compact Mobile Optimized) */}
      <footer className="fixed bottom-0 left-0 right-0 w-full py-1.5 sm:py-2.5 px-3 sm:px-8 lg:px-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 z-30 font-medium leading-tight">
        {/* Left Side: Copyright */}
        <div className="text-center sm:text-left">{t.copyright}</div>

        {/* Right Side: Quick Policy Links */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-slate-500 dark:text-slate-400 shrink-0">
          <a
            href="#privacy"
            onClick={e => e.preventDefault()}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.privacy}
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="#terms"
            onClick={e => e.preventDefault()}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.terms}
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="#help"
            onClick={e => e.preventDefault()}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.help}
          </a>
        </div>
      </footer>
    </div>
  );
}
