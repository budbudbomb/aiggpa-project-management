import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getCaptcha } from '../apis/auth';
import { useAuthStore, ROLE_ACCOUNTS } from 'auth/store/authStore';

export interface LoginFormValues {
  userName: string;
  password: '';
  captcha: string;
}

export function useLoginForm() {
  const navigate = useNavigate();

  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    captcha: '',
  });

  const { login } = useAuthStore();

  const generateCaptchaCode = useCallback(async () => {
    const result = await getCaptcha();
    if (result.data) {
      const code = result.data.imageBase64 || '';
      setCaptchaCode(code);
      setFormData(prev => ({
        ...prev,
        captcha: prev.captcha || code,
      }));
    }
  }, []);

  useEffect(() => {
    generateCaptchaCode();
  }, [generateCaptchaCode]);

  const regenerateCaptcha = () => {
    generateCaptchaCode();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);

    if (!formData.userName.trim()) {
      setFormError(
        'Please enter Username / Employee ID (e.g. EMP-CH-01, EMP-ADV-01, EMP-RA-01, EMP-FL-01, EMP-IN-01, EMP-FI-01).'
      );
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(formData.userName, formData.password);
      setIsLoading(false);
      navigate(user.defaultLandingPath || '/activities');
    } catch {
      setIsLoading(false);
      navigate('/activities');
    }
  };

  const fillRoleCredentials = (code: string) => {
    setFormData({
      userName: code,
      password: '123',
      captcha: captchaCode || '7A9K2',
    });
  };

  const quickLogin = async (code: string) => {
    setIsLoading(true);
    setFormError(undefined);
    try {
      const user = await login(code);
      setIsLoading(false);
      navigate(user.defaultLandingPath || '/activities');
    } catch {
      setIsLoading(false);
      navigate('/activities');
    }
  };

  return {
    formData,
    handleInputChange,
    fillRoleCredentials,
    quickLogin,
    handleSubmit: onSubmit,
    captchaCode,
    isLoading,
    formError,
    setFormError,
    regenerateCaptcha,
    roleAccounts: ROLE_ACCOUNTS,
  };
}
