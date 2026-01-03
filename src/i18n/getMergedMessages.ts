import type { Locale } from './routing';

/**
 * 메시지 병합 로직
 * Fallback 체인:
 * - en: en → ko (en이 없으면 ko 사용)
 * - ko: ko → en (ko가 없으면 en 사용)
 * - ja: ja → ko → en (ja가 없으면 ko, ko도 없으면 en 사용)
 */
const getFallbackChain = (locale: Locale): Locale[] => {
  switch (locale) {
    case 'en':
      return ['en', 'ko'];
    case 'ko':
      return ['ko', 'en'];
    case 'ja':
      return ['ja', 'ko', 'en'];
    default:
      return ['en'];
  }
};

/**
 * 메시지 파일을 동적으로 로드하고 병합
 */
const loadMessages = async (locale: Locale): Promise<Record<string, unknown>> => {
  const fallbackChain = getFallbackChain(locale);
  const mergedMessages: Record<string, Record<string, unknown>> = {};

  // Fallback 체인을 순서대로 순회: 요청한 로케일을 먼저 로드하고, 없으면 fallback 사용
  for (const fallbackLocale of fallbackChain) {
    try {
      // 네임스페이스별로 메시지 로드
      const namespaces = [
        'common',
        'header',
        'footer',
        'mypage',
        'company',
        'program',
        'reservation',
        'review',
        'search',
        'booking',
        'error',
        'auth',
        'validation',
        'calendar',
        'category',
        'categories',
        'filter',
        'map',
        'review-form',
        'review-list',
        'company-detail',
        'program-detail',
        'reservation-detail',
        'booking-detail',
        'user-info',
        'settings',
        'notification',
        'payment',
        'success',
        'confirm',
        'cancel',
        'delete',
        'save',
        'edit',
        'create',
        'update',
        'loading',
        'empty',
      ];

      for (const namespace of namespaces) {
        try {
          const messagesModule = await import(`../../messages/${fallbackLocale}/${namespace}.json`);
          const messages =
            (messagesModule as { default?: Record<string, unknown> }).default ?? messagesModule;

          if (!mergedMessages[namespace]) {
            mergedMessages[namespace] = {};
          }
          // 병합: 먼저 로드된 메시지가 우선순위를 가짐 (요청한 로케일이 fallback보다 우선)
          // 이미 값이 있으면 덮어쓰지 않음
          // 기존 메시지에 없는 키만 추가 (fallback 메시지)
          for (const key in messages) {
            if (!(key in mergedMessages[namespace])) {
              mergedMessages[namespace][key] = messages[key];
            } else if (
              typeof mergedMessages[namespace][key] === 'object' &&
              typeof messages[key] === 'object'
            ) {
              // 중첩 객체인 경우 재귀적으로 병합
              mergedMessages[namespace][key] = {
                ...messages[key],
                ...mergedMessages[namespace][key],
              };
            }
          }
        } catch {
          // 네임스페이스 파일이 없으면 무시
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Missing namespace: ${fallbackLocale}/${namespace}.json`);
          }
        }
      }
    } catch {
      // 로케일 폴더가 없으면 무시
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing locale: ${fallbackLocale}`);
      }
    }
  }

  return mergedMessages;
};

/**
 * next-intl 서버 설정
 * Pages Router에서 getServerSideProps/getStaticProps에서 사용
 */
export const getMergedMessages = async (locale: Locale) => {
  const messages = await loadMessages(locale);
  return messages;
};
