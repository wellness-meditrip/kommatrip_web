import { postTokenReissue } from '@/apis/auth';
import { AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { useAuthStore } from '@/store/auth';
import { getCookie } from '@/utils/cookie';
import {
  beginAuthRefresh,
  isAuthRefreshInFlight,
  rejectAuthRefresh,
  resolveAuthRefresh,
  waitForAuthReady,
} from '@/utils/auth-refresh';
import { isUsableAccessToken } from '@/utils/auth-token';

export type EnsureAccessTokenReason =
  | 'store_token'
  | 'waited_refresh'
  | 'manual_reissue'
  | 'missing_refresh_capability'
  | 'reissue_failed';

export interface EnsureAccessTokenOptions {
  staleWindowSeconds?: number;
}

export interface EnsureAccessTokenResult {
  token: string | null;
  reason: EnsureAccessTokenReason;
  error?: unknown;
}

const getStoreToken = () => useAuthStore.getState().accessToken;

const applyStoreToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};

/**
 * 액션 직전 access token 확보 공통 유틸.
 * 우선순위: store -> in-flight refresh 대기 -> manual reissue
 */
export const ensureAccessToken = async (
  options: EnsureAccessTokenOptions
): Promise<EnsureAccessTokenResult> => {
  const staleWindowSeconds = options.staleWindowSeconds ?? 10;

  const storeToken = getStoreToken();
  if (isUsableAccessToken(storeToken, staleWindowSeconds)) {
    return { token: storeToken as string, reason: 'store_token' };
  }

  if (isAuthRefreshInFlight()) {
    try {
      await waitForAuthReady();
    } catch (error) {
      // 기존 refresh 파이프라인 실패는 아래 manual reissue로 한 번 더 복구를 시도한다.
      console.error('[ensureAccessToken] waitForAuthReady failed', error);
    }
    const tokenAfterWait = getStoreToken();
    if (isUsableAccessToken(tokenAfterWait, staleWindowSeconds)) {
      return { token: tokenAfterWait as string, reason: 'waited_refresh' };
    }
  }

  const hasRefreshMarker = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
  if (!hasRefreshMarker) {
    return { token: null, reason: 'missing_refresh_capability' };
  }

  let startedRefresh = false;
  if (!isAuthRefreshInFlight()) {
    beginAuthRefresh();
    startedRefresh = true;
  }

  try {
    const response = await postTokenReissue();
    const reissuedToken = response.tokens.access_token;

    if (isUsableAccessToken(reissuedToken, staleWindowSeconds)) {
      applyStoreToken(reissuedToken);
      if (startedRefresh) {
        resolveAuthRefresh();
      }
      return { token: reissuedToken, reason: 'manual_reissue' };
    }

    if (startedRefresh) {
      rejectAuthRefresh(new Error('No usable access token in token reissue response'));
    }
    return { token: null, reason: 'reissue_failed' };
  } catch (error) {
    if (startedRefresh) {
      rejectAuthRefresh(error);
    }
    return { token: null, reason: 'reissue_failed', error };
  }
};
