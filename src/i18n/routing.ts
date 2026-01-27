// UI 로케일: 라우팅에 사용
export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

// 콘텐츠 로케일: 데이터 다국어 필드용 (현재는 UI 로케일과 동일)
export const contentLocales = ['ko', 'en'] as const;
export type ContentLocale = (typeof contentLocales)[number];

// 기본 로케일
export const defaultLocale: Locale = 'en';

// 라우팅 설정 (Pages Router에서는 간단한 설정만 사용)
export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const,
};
