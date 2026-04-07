import { routing } from './routing';
import { getMergedMessages } from './getMergedMessages';
import type { Locale } from './routing';
import type { MessageNamespace } from './namespaces';
import { detectRequestLocale } from './locale';

/**
 * Pages Router용 request config
 * getServerSideProps/getStaticProps에서 사용
 */
export const getI18nConfig = async (locale?: string, namespaces?: readonly MessageNamespace[]) => {
  // 유효하지 않은 로케일이면 기본 로케일 사용
  const validLocale: Locale =
    locale && routing.locales.includes(locale as Locale)
      ? (locale as Locale)
      : routing.defaultLocale;

  const messages = await getMergedMessages(validLocale, namespaces);

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

  return detectRequestLocale({
    pathname: window.location.pathname,
    cookieHeader: document.cookie,
  });
};
