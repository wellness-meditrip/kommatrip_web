export const AUTH_COOKIE_KEYS = {
  GOOGLE_AUTH_META: 'google_auth_meta',
  REFRESH_TOKEN: 'refreshToken',
  REFRESH_TOKEN_FLAG: 'hasRefreshToken',
} as const;

export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
