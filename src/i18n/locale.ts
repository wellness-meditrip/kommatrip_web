import { routing, type Locale } from './routing';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

const EXTERNAL_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

const isLocale = (value?: string | null): value is Locale =>
  !!value && routing.locales.includes(value as Locale);

const isExternalHref = (href: string) => EXTERNAL_URL_PATTERN.test(href) || href.startsWith('//');

const splitHref = (href: string) => {
  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  const queryIndex = normalizedHref.indexOf('?');
  const hashIndex = normalizedHref.indexOf('#');
  const separatorIndex =
    queryIndex === -1 ? hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);

  if (separatorIndex === -1) {
    return { pathname: normalizedHref, suffix: '' };
  }

  return {
    pathname: normalizedHref.slice(0, separatorIndex) || '/',
    suffix: normalizedHref.slice(separatorIndex),
  };
};

export const resolveLocale = (value?: string | null): Locale | null =>
  isLocale(value) ? value : null;

export const resolveLocaleFromHeaderValue = (value?: string | string[] | null): Locale | null => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return resolveLocale(candidate);
};

export const resolveLocaleFromPath = (path?: string | null): Locale | null => {
  if (!path || isExternalHref(path) || path.startsWith('?') || path.startsWith('#')) {
    return null;
  }

  const { pathname } = splitHref(path);
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return resolveLocale(firstSegment);
};

export const resolveLocaleFromCookieHeader = (cookieHeader?: string | null): Locale | null => {
  if (!cookieHeader) return null;

  const cookieValue = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  return resolveLocale(cookieValue ? decodeURIComponent(cookieValue) : null);
};

interface DetectRequestLocaleOptions {
  locale?: string | null;
  localeHeader?: string | string[] | null;
  pathname?: string | null;
  cookieHeader?: string | null;
  cookieLocale?: string | null;
}

export const detectRequestLocale = ({
  locale,
  localeHeader,
  pathname,
  cookieHeader,
  cookieLocale,
}: DetectRequestLocaleOptions): Locale =>
  resolveLocaleFromHeaderValue(localeHeader) ??
  resolveLocale(locale) ??
  resolveLocaleFromPath(pathname) ??
  resolveLocale(cookieLocale) ??
  resolveLocaleFromCookieHeader(cookieHeader) ??
  routing.defaultLocale;

export const stripLocalePrefix = (href: string): string => {
  if (!href || isExternalHref(href) || href.startsWith('?') || href.startsWith('#')) {
    return href;
  }

  const { pathname, suffix } = splitHref(href);
  const locale = resolveLocaleFromPath(pathname);

  if (!locale) {
    return `${pathname}${suffix}`;
  }

  const strippedPathname = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
  return `${strippedPathname}${suffix}`;
};

export const getLocalizedPath = (href: string, locale: Locale): string => {
  if (!href || isExternalHref(href) || href.startsWith('?') || href.startsWith('#')) {
    return href;
  }

  const { pathname, suffix } = splitHref(href);

  if (resolveLocaleFromPath(pathname)) {
    return `${pathname}${suffix}`;
  }

  return pathname === '/' ? `/${locale}${suffix}` : `/${locale}${pathname}${suffix}`;
};
