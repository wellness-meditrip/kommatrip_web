import { AUTH_COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE_SECONDS } from '@/constants';

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

export const createRefreshTokenCookies = (refreshToken: string) => [
  buildCookie({
    name: AUTH_COOKIE_KEYS.REFRESH_TOKEN,
    value: refreshToken,
    maxAgeSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: isProduction,
  }),
  buildCookie({
    name: AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG,
    value: '1',
    maxAgeSeconds: REFRESH_TOKEN_MAX_AGE_SECONDS,
    secure: isProduction,
  }),
];

export const createExpiredAuthCookies = () => [
  buildCookie({
    name: AUTH_COOKIE_KEYS.REFRESH_TOKEN,
    value: '',
    maxAgeSeconds: 0,
    httpOnly: true,
    secure: isProduction,
  }),
  buildCookie({
    name: AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG,
    value: '',
    maxAgeSeconds: 0,
    secure: isProduction,
  }),
];

export const createExpiredGoogleMetaCookie = () =>
  buildCookie({
    name: AUTH_COOKIE_KEYS.GOOGLE_AUTH_META,
    value: '',
    maxAgeSeconds: 0,
    httpOnly: true,
    secure: isProduction,
  });
