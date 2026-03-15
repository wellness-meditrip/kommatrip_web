const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

/**
 * 서버 사이드에서 사용할 백엔드 base URL을 해석한다.
 * NEXT_PUBLIC_* 값은 서버 코드에서 사용하지 않는다.
 */
export const getBackendBaseUrl = (): string => {
  const serverOnlyBaseUrl = process.env.BACKEND_API_URL?.trim();
  if (serverOnlyBaseUrl) return trimTrailingSlash(serverOnlyBaseUrl);

  throw new Error('Missing BACKEND_API_URL');
};
