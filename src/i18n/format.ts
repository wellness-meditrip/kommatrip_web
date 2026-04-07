import { resolveLocale } from './locale';
import { routing, type Locale } from './routing';

const INTL_LOCALE_BY_UI_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  ko: 'ko-KR',
};

const REFERENCE_SUNDAY = new Date(Date.UTC(2024, 0, 7));

const normalizeLocale = (locale?: string | null): Locale =>
  resolveLocale(locale) ?? routing.defaultLocale;

export const toIntlLocale = (locale?: string | null): string =>
  INTL_LOCALE_BY_UI_LOCALE[normalizeLocale(locale)];

export const formatMonthDayWithWeekday = (date: Date, locale?: string | null): string => {
  const intlLocale = toIntlLocale(locale);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' }).format(date);
  return `${month}.${day}(${weekday})`;
};

export const formatMonthYearLabel = (date: Date, locale?: string | null): string =>
  new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: 'long',
    year: 'numeric',
  }).format(date);

export const getWeekdayLabels = (locale?: string | null): string[] => {
  const intlLocale = toIntlLocale(locale);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(REFERENCE_SUNDAY);
    date.setUTCDate(REFERENCE_SUNDAY.getUTCDate() + index);
    return new Intl.DateTimeFormat(intlLocale, {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(date);
  });
};

export const formatNumberWithCurrencyCode = (
  value: number,
  locale?: string | null,
  currencyCode = 'KRW'
): string => {
  const normalizedCurrencyCode = currencyCode.trim().toUpperCase() || 'KRW';
  return `${new Intl.NumberFormat(toIntlLocale(locale), {
    maximumFractionDigits: normalizedCurrencyCode === 'KRW' ? 0 : 2,
  }).format(value)} ${normalizedCurrencyCode}`;
};

export const formatDurationMinutes = (minutes: number, locale?: string | null): string =>
  normalizeLocale(locale) === 'ko' ? `${minutes}분` : `${minutes} mins`;
