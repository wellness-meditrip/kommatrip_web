import {
  ADMIN_AUTH_COOKIE_KEYS,
  AUTH_COOKIE_KEYS,
  type AuthCookieKeys,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from '@/constants/commons/auth-cookies';

const isProduction = process.env.NODE_ENV === 'production';

const buildCookie = (params: {
  name: string;
  value: string;
  maxAgeSeconds: number;
  httpOnly?: boolean;
  secure?: boolean;
}) => {
  const parts = [
    `${params.name}=${encodeURIComponent(params.value)}`,
    'Path=/',
    `Max-Age=${params.maxAgeSeconds}`,
    'SameSite=Lax',
  ];

  if (params.httpOnly) {
    parts.push('HttpOnly');
  }
  if (params.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
};

const createRefreshCookies = (cookieKeys: AuthCookieKeys, refreshToken: string) => [
  buildCookie({
    name: cookieKeys.REFRESH_TOKEN,
    value: refreshToken,
    maxAgeSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: isProduction,
  }),
  buildCookie({
    name: cookieKeys.REFRESH_TOKEN_FLAG,
    value: '1',
    maxAgeSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
    secure: isProduction,
  }),
];

const createExpiredCookies = (cookieKeys: AuthCookieKeys) => [
  buildCookie({
    name: cookieKeys.REFRESH_TOKEN,
    value: '',
    maxAgeSeconds: 0,
    httpOnly: true,
    secure: isProduction,
  }),
  buildCookie({
    name: cookieKeys.REFRESH_TOKEN_FLAG,
    value: '',
    maxAgeSeconds: 0,
    secure: isProduction,
  }),
];

export const createRefreshTokenCookies = (refreshToken: string) =>
  createRefreshCookies(AUTH_COOKIE_KEYS, refreshToken);

export const createAdminRefreshTokenCookies = (refreshToken: string) =>
  createRefreshCookies(ADMIN_AUTH_COOKIE_KEYS, refreshToken);

export const createExpiredAuthCookies = () => createExpiredCookies(AUTH_COOKIE_KEYS);

export const createExpiredAdminAuthCookies = () => createExpiredCookies(ADMIN_AUTH_COOKIE_KEYS);
