import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ComponentProps } from 'react';
import { routing, type Locale } from './routing';
import { getCookie } from '@/utils/cookie';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  locale?: Locale;
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
  const router = useRouter();

  // 현재 로케일 추출
  const currentPath = router.asPath;
  const pathSegments = currentPath.split('/').filter(Boolean);
  const currentLocale: Locale =
    pathSegments.length > 0 && routing.locales.includes(pathSegments[0] as Locale)
      ? (pathSegments[0] as Locale)
      : routing.defaultLocale;

  // 사용할 로케일 결정
  const targetLocale = locale || currentLocale;

  // href가 이미 로케일 프리픽스를 포함하고 있는지 확인
  const hrefSegments = href.split('/').filter(Boolean);
  const hasLocalePrefix =
    hrefSegments.length > 0 && routing.locales.includes(hrefSegments[0] as Locale);

  // 로케일 프리픽스가 없으면 추가
  const localizedHref = hasLocalePrefix
    ? href
    : `/${targetLocale}${href.startsWith('/') ? href : `/${href}`}`;

  return <Link href={localizedHref} {...props} />;
}

/**
 * 로케일을 변경하면서 리다이렉트하는 함수
 */
export function useChangeLocale() {
  const router = useRouter();

  return (locale: Locale) => {
    // 현재 경로 가져오기 (쿼리 파라미터 제외)
    const currentPath = router.asPath.split('?')[0];
    const pathSegments = currentPath.split('/').filter(Boolean);

    // 현재 경로에서 로케일 제거
    let pathWithoutLocale = '/';
    if (pathSegments.length > 0 && routing.locales.includes(pathSegments[0] as Locale)) {
      // 첫 번째 세그먼트가 로케일이면 제거
      pathWithoutLocale = '/' + pathSegments.slice(1).join('/');
    } else {
      // 로케일이 없으면 현재 경로 사용
      pathWithoutLocale = currentPath === '/' ? '/' : currentPath;
    }

    // 빈 경로 처리
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = '';
    }

    // 새 로케일로 경로 구성
    const newPath = `/${locale}${pathWithoutLocale}`;

    // 쿼리 파라미터 유지
    const queryString = router.asPath.includes('?')
      ? router.asPath.substring(router.asPath.indexOf('?'))
      : '';

    // 쿠키에 새 로케일 저장
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;

    router.push(`${newPath}${queryString}`);
  };
}

/**
 * 현재 로케일을 가져오는 훅
 */
export function useCurrentLocale(): Locale {
  const router = useRouter();

  // 1. 쿠키에서 로케일 확인 (가장 신뢰할 수 있는 소스)
  const cookieLocale = getCookie('NEXT_LOCALE');
  if (cookieLocale && routing.locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. URL 경로에서 로케일 확인 (쿼리 파라미터 제외)
  const currentPath = router.asPath.split('?')[0];
  const pathSegments = currentPath.split('/').filter(Boolean);
  if (pathSegments.length > 0 && routing.locales.includes(pathSegments[0] as Locale)) {
    return pathSegments[0] as Locale;
  }

  // 3. 기본값 반환
  return routing.defaultLocale;
}
