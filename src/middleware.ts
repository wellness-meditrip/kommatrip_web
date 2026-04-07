import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_KEYS, AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { locales, type Locale } from './i18n/routing';
import { detectRequestLocale, LOCALE_COOKIE_NAME } from './i18n/locale';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1년

/**
 * 로케일 감지 순서:
 * 1. URL 경로의 로케일 프리픽스
 * 2. 쿠키 (NEXT_LOCALE)
 * 3. 기본값: en
 */
function detectLocale(request: NextRequest): Locale {
  return detectRequestLocale({
    pathname: request.nextUrl.pathname,
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
  });
}

/**
 * 경로가 다국어 처리에서 제외되어야 하는지 확인
 */
function shouldSkipLocale(pathname: string): boolean {
  // API 라우트 제외
  if (pathname.startsWith('/api')) {
    return true;
  }

  // 정적 파일 제외
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return true;
  }

  // 관리자 페이지 제외 (필요시)
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return true;
  }

  return false;
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAdminLoginPath(pathname: string): boolean {
  return pathname === '/admin/login';
}

/**
 * 로케일 프리픽스가 있는 경로인지 확인
 */
function hasLocalePrefix(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 && locales.includes(segments[0] as Locale);
}

const PROTECTED_PATH_PREFIXES = ['/bookings', '/reservations', '/mypage/reviews'];

function isProtectedPath(pathname: string): boolean {
  if (
    PROTECTED_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return true;
  }

  return /^\/company\/[^/]+\/reviews(?:\/|$)/.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    const hasAdminRefreshToken = request.cookies.has(ADMIN_AUTH_COOKIE_KEYS.REFRESH_TOKEN);

    if (!isAdminLoginPath(pathname) && !hasAdminRefreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      const nextPath = `${pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set('next', nextPath);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 다국어 처리 제외 경로
  if (shouldSkipLocale(pathname)) {
    return NextResponse.next();
  }

  const hasPrefix = hasLocalePrefix(pathname);
  const locale = hasPrefix ? (pathname.split('/')[1] as Locale) : detectLocale(request);
  const pathWithoutLocale = hasPrefix ? `/${pathname.split('/').slice(2).join('/')}` : pathname;
  const actualPath = pathWithoutLocale === '' ? '/' : pathWithoutLocale;
  const legacyReviewEditMatch = actualPath.match(/^\/review\/([^/]+)(?:\/|$)/);

  if (actualPath === '/review') {
    const homeUrl = new URL(`/${locale}`, request.url);
    homeUrl.search = request.nextUrl.search;
    return NextResponse.redirect(homeUrl);
  }

  if (legacyReviewEditMatch) {
    const reviewId = legacyReviewEditMatch[1];
    const reviewEditUrl = new URL(`/${locale}/mypage/reviews/${reviewId}`, request.url);
    reviewEditUrl.search = request.nextUrl.search;
    return NextResponse.redirect(reviewEditUrl);
  }

  if (isProtectedPath(actualPath)) {
    const hasRefreshToken = request.cookies.has(AUTH_COOKIE_KEYS.REFRESH_TOKEN);

    if (!hasRefreshToken) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      const callbackPath = hasPrefix ? pathname : `/${locale}${pathname}`;
      const callbackUrl = `${callbackPath}${request.nextUrl.search}`;
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 이미 로케일 프리픽스가 있는 경우
  if (hasPrefix) {
    // 내부적으로 경로를 변환 (rewrite)
    const url = request.nextUrl.clone();
    url.pathname = actualPath;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', locale);
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });

    // 쿠키에 로케일 저장
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  }

  // 로케일 프리픽스 추가하여 리다이렉트
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const response = NextResponse.redirect(newUrl);

  // 쿠키에 로케일 저장
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  // 매처: 모든 경로에 적용하되, 정적 파일 및 API 경로는 철저히 제외
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (all static files with specific extensions)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|json|txt|webmanifest)$).*)',
  ],
};
