import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, type Locale } from './i18n/routing';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1년

/**
 * 로케일 감지 순서:
 * 1. URL 경로의 로케일 프리픽스
 * 2. 쿠키 (NEXT_LOCALE)
 * 3. 브라우저 Accept-Language 헤더 (일본어만 감지)
 * 4. 기본값: en
 */
function detectLocale(request: NextRequest): Locale {
  const { pathname } = request.nextUrl;

  // 1. URL 경로에서 로케일 확인
  const pathnameLocale = pathname.split('/')[1];
  if (pathnameLocale && locales.includes(pathnameLocale as Locale)) {
    return pathnameLocale as Locale;
  }

  // 2. 쿠키에서 로케일 확인
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 3. Accept-Language 헤더에서 감지 (일본어만)
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // 일본어 감지
    if (acceptLanguage.includes('ja')) {
      return 'ja';
    }
    // 한국어 감지
    if (acceptLanguage.includes('ko')) {
      return 'ko';
    }
  }

  // 4. 기본값
  return defaultLocale;
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
  if (pathname.startsWith('/admin')) {
    return true;
  }

  return false;
}

/**
 * 로케일 프리픽스가 있는 경로인지 확인
 */
function hasLocalePrefix(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 && locales.includes(segments[0] as Locale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 다국어 처리 제외 경로
  if (shouldSkipLocale(pathname)) {
    return NextResponse.next();
  }

  // 이미 로케일 프리픽스가 있는 경우
  if (hasLocalePrefix(pathname)) {
    const locale = pathname.split('/')[1] as Locale;

    // 로케일 프리픽스를 제거한 실제 경로 생성
    const pathWithoutLocale = '/' + pathname.split('/').slice(2).join('/');
    const actualPath = pathWithoutLocale === '/' ? '/' : pathWithoutLocale;

    // 내부적으로 경로를 변환 (rewrite)
    const url = request.nextUrl.clone();
    url.pathname = actualPath;

    const response = NextResponse.rewrite(url);

    // 쿠키에 로케일 저장
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });

    // 헤더에 로케일 정보 추가 (페이지에서 사용할 수 있도록)
    response.headers.set('x-locale', locale);

    return response;
  }

  // 로케일 감지
  const locale = detectLocale(request);

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
  // 매처: 모든 경로에 적용하되, 제외 경로는 shouldSkipLocale에서 처리
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
