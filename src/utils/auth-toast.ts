import { emitToast } from '@/utils/toast-bus';

const AUTH_TOAST_THROTTLE_MS = 3000;

let lastAuthToastAt = 0;

const AUTH_SESSION_EXPIRED_MESSAGES: Record<string, string> = {
  ko: '세션이 만료되었어요. 다시 로그인해 주세요.',
  en: 'Your session expired. Please log in again.',
  ja: 'セッションの有効期限が切れました。もう一度ログインしてください。',
};

const resolveLocale = () => {
  if (typeof window === 'undefined') return 'en';

  const pathname = window.location.pathname;
  const [, maybeLocale] = pathname.split('/');
  if (maybeLocale === 'ko' || maybeLocale === 'en' || maybeLocale === 'ja') {
    return maybeLocale;
  }

  const htmlLang = document.documentElement.lang;
  if (htmlLang === 'ko' || htmlLang === 'en' || htmlLang === 'ja') {
    return htmlLang;
  }

  return 'en';
};

export const emitSessionExpiredToast = () => {
  const now = Date.now();
  if (now - lastAuthToastAt < AUTH_TOAST_THROTTLE_MS) return;

  lastAuthToastAt = now;
  const locale = resolveLocale();

  emitToast({
    title: AUTH_SESSION_EXPIRED_MESSAGES[locale] ?? AUTH_SESSION_EXPIRED_MESSAGES.en,
    icon: 'exclaim',
  });
};
