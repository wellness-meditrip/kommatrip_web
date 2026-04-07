import Link from 'next/link';
import { useRouter, type NextRouter } from 'next/router';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { routing, type Locale } from './routing';
import {
  getLocalizedPath,
  LOCALE_COOKIE_NAME,
  resolveLocale,
  resolveLocaleFromPath,
  stripLocalePrefix,
} from './locale';
import { getCookie, setCookie } from '@/utils/cookie';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  locale?: Locale;
};

type RouterUrl = Parameters<NextRouter['push']>[0];
type RouterAs = Parameters<NextRouter['push']>[1];

type LocalizedRouter = NextRouter & {
  currentLocale: Locale;
  localize: (href: string) => string;
};

const localizeUrl = <T extends RouterUrl | RouterAs | undefined>(url: T, locale: Locale): T => {
  if (!url) return url;

  if (typeof url === 'string') {
    return getLocalizedPath(url, locale) as T;
  }

  const nextUrl = url as Exclude<T, string | undefined>;

  if (!nextUrl.pathname || typeof nextUrl.pathname !== 'string') {
    return url;
  }

  return {
    ...nextUrl,
    pathname: getLocalizedPath(nextUrl.pathname, locale),
  } as T;
};

/**
 * 로케일을 자동으로 유지하면서 라우팅하는 Link 컴포넌트
 *
 * @example
 * ```tsx
 * import { Link } from '@/i18n/navigation';
 *
 * <Link href="/company">Company</Link>
 * <Link href="/company" locale="en">Company (English)</Link>
 * ```
 */
export function I18nLink({ href, locale, ...props }: Props) {
  const currentLocale = useCurrentLocale();
  const targetLocale = locale || currentLocale;
  return <Link href={getLocalizedPath(href, targetLocale)} {...props} />;
}

/**
 * 로케일을 변경하면서 리다이렉트하는 함수
 */
export function useChangeLocale() {
  const router = useRouter();

  return (locale: Locale) => {
    setCookie(LOCALE_COOKIE_NAME, locale, 365);
    void router.push(getLocalizedPath(stripLocalePrefix(router.asPath), locale));
  };
}

/**
 * 현재 로케일을 가져오는 훅
 */
export function useCurrentLocale(): Locale {
  const router = useRouter();
  return (
    resolveLocaleFromPath(router.asPath) ??
    resolveLocale(getCookie(LOCALE_COOKIE_NAME)) ??
    routing.defaultLocale
  );
}

export function useLocalizedRouter(): LocalizedRouter {
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  return useMemo(
    () => ({
      ...router,
      currentLocale,
      localize: (href: string) => getLocalizedPath(href, currentLocale),
      push: (url, as, options) =>
        router.push(localizeUrl(url, currentLocale), localizeUrl(as, currentLocale), options),
      replace: (url, as, options) =>
        router.replace(localizeUrl(url, currentLocale), localizeUrl(as, currentLocale), options),
      prefetch: (url, as, options) =>
        router.prefetch(localizeUrl(url, currentLocale), localizeUrl(as, currentLocale), options),
    }),
    [currentLocale, router]
  );
}
