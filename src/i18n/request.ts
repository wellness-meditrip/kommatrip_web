import { routing } from './routing';
import { getMergedMessages } from './getMergedMessages';
import type { Locale } from './routing';

/**
 * Pages Router용 request config
 * getServerSideProps/getStaticProps에서 사용
 */
export const getI18nConfig = async (locale?: string) => {
  // 유효하지 않은 로케일이면 기본 로케일 사용
  const validLocale: Locale =
    locale && routing.locales.includes(locale as Locale)
      ? (locale as Locale)
      : routing.defaultLocale;

  const messages = await getMergedMessages(validLocale);

  return {
    locale: validLocale,
    messages,
  };
};

/**
 * 클라이언트에서 사용할 수 있는 로케일 감지 헬퍼
 */
export const detectLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return routing.defaultLocale;
  }

  // 쿠키에서 로케일 확인
  const cookieLocale = document.cookie
    .split('; ')
    .find((row) => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];

  if (cookieLocale && routing.locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 브라우저 언어 감지
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ko' && routing.locales.includes('ko')) {
    return 'ko';
  }

  return routing.defaultLocale;
};
