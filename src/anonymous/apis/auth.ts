export interface CaptchaResponse {
  imageBase64?: string;
  captchaRequestId: string;
}

export interface UserInfo {
  id: string;
  userName: string;
  role: string;
  email?: string;
}

export async function getCaptcha(): Promise<{ data: CaptchaResponse }> {
  // Generate random 6-character captcha string
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captchaCode = '';
  for (let i = 0; i < 6; i++) {
    captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return {
    data: {
      captchaRequestId: 'req_' + Math.random().toString(36).substring(2, 9),
      imageBase64: captchaCode,
    },
  };
}

export async function getEncryptionKey() {
  return {
    data: {
      requestId: 'enc_' + Math.random().toString(36).substring(2, 9),
      publicKey: 'mock-public-key',
    },
    error: null,
  };
}

export async function authLogin(data: {
  userName?: string;
  password?: string;
}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!data.userName || !data.password) {
    return 'Invalid username or password';
  }
  return null; // Return null on success
}

export async function getUserInfo(): Promise<{
  data?: UserInfo;
  error?: string;
}> {
  return {
    data: {
      id: 'usr_101',
      userName: 'Officer User',
      role: 'Officer',
      email: 'officer@educationportal.in',
    },
  };
}
