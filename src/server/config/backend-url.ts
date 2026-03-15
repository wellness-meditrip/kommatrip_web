const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

/**
 * 서버 사이드에서 백엔드 base URL을 해석한다.
 * - 1순위: BACKEND_API_URL (server-only)
 * - 2순위: NEXT_PUBLIC_API_URL (legacy fallback)
 */
export const getBackendBaseUrl = (): string => {
  const serverOnlyBaseUrl = process.env.BACKEND_API_URL?.trim();
  if (serverOnlyBaseUrl) return trimTrailingSlash(serverOnlyBaseUrl);

  const legacyPublicBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (legacyPublicBaseUrl) return trimTrailingSlash(legacyPublicBaseUrl);

  throw new Error('Missing BACKEND_API_URL (fallback: NEXT_PUBLIC_API_URL)');
};
