export const AUTH_COOKIE_KEYS = {
  REFRESH_TOKEN: 'refreshToken',
  REFRESH_TOKEN_FLAG: 'hasRefreshToken',
} as const;

export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;
