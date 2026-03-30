export interface AuthCookieKeys {
  REFRESH_TOKEN: string;
  REFRESH_TOKEN_FLAG: string;
}

export const AUTH_COOKIE_KEYS: AuthCookieKeys = {
  REFRESH_TOKEN: 'refreshToken',
  REFRESH_TOKEN_FLAG: 'hasRefreshToken',
} as const;

export const ADMIN_AUTH_COOKIE_KEYS: AuthCookieKeys = {
  REFRESH_TOKEN: 'adminRefreshToken',
  REFRESH_TOKEN_FLAG: 'hasAdminRefreshToken',
} as const;

export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;
