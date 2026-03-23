import { defaultLocale, routing } from '@/i18n/routing';
import type { MetaAlternate } from './meta.types';

export const toAbsoluteUrl = (siteUrl: string, value?: string) => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (!siteUrl) return undefined;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

export const normalizeMetaPath = (value?: string) => {
  if (!value) return '/';

  const withoutOrigin = value.replace(/^https?:\/\/[^/]+/i, '');
  const withoutHash = withoutOrigin.split('#')[0] ?? withoutOrigin;
  const withoutQuery = withoutHash.split('?')[0] ?? withoutHash;
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
};

const toLocaleAgnosticPath = (value?: string) => {
  const normalized = normalizeMetaPath(value);
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] && routing.locales.includes(segments[0] as (typeof routing.locales)[number])) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
};

export const buildLocaleAlternates = (siteUrl: string, value?: string): MetaAlternate[] => {
  if (!siteUrl || !value) return [];

  const normalizedPath = toLocaleAgnosticPath(value);
  const alternates: MetaAlternate[] = routing.locales.map((locale) => ({
    hrefLang: locale,
    href: `${siteUrl}/${locale}${normalizedPath === '/' ? '' : normalizedPath}`,
  }));

  alternates.push({
    hrefLang: 'x-default',
    href: `${siteUrl}/${defaultLocale}${normalizedPath === '/' ? '' : normalizedPath}`,
  });

  return alternates;
};

export const buildTitle = ({
  keyword,
  pageTitle,
  appName,
}: {
  keyword?: string;
  pageTitle: string;
  appName?: string;
}) => {
  const shouldAppendAppName = appName ? !pageTitle.includes(appName) : false;
  if (keyword) {
    if (appName && shouldAppendAppName) {
      return `${keyword} - ${pageTitle} | ${appName}`;
    }
    return `${keyword} - ${pageTitle}`;
  }
  return appName && shouldAppendAppName ? `${pageTitle} | ${appName}` : pageTitle;
};
