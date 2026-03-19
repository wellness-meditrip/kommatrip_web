import { parseJwtPayload } from '@/utils/auth-token';
import type { SocialProvider } from '@/models/auth';

export const SOCIAL_AUTH_STORAGE_KEY = 'pending_social_auth';
export const SOCIAL_AUTH_CALLBACK_PATH = '/auth/social/callback';

interface PendingSocialAuth {
  provider: SocialProvider;
  state: string;
  nonce: string;
  country: string;
  marketingConsent: boolean;
  callbackUrl: string;
}

interface SocialCallbackParams {
  idToken: string | null;
  state: string | null;
  error: string | null;
}

const createRandomString = () => {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const getGoogleClientId = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const getAppleClientId = () => process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

const getSocialCallbackUrl = () =>
  process.env.NEXT_PUBLIC_SOCIAL_CALLBACK_URL ||
  `${window.location.origin}${SOCIAL_AUTH_CALLBACK_PATH}`;

const persistPendingSocialAuth = (value: PendingSocialAuth) => {
  window.sessionStorage.setItem(SOCIAL_AUTH_STORAGE_KEY, JSON.stringify(value));
};

export const consumePendingSocialAuth = (): PendingSocialAuth | null => {
  const raw = window.sessionStorage.getItem(SOCIAL_AUTH_STORAGE_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(SOCIAL_AUTH_STORAGE_KEY);

  try {
    return JSON.parse(raw) as PendingSocialAuth;
  } catch {
    return null;
  }
};

export const startSocialLogin = (params: {
  provider: SocialProvider;
  country: string;
  marketingConsent: boolean;
  callbackUrl: string;
}) => {
  const state = createRandomString();
  const nonce = createRandomString();
  const callbackUrl = params.callbackUrl || '/';
  const redirectUri = getSocialCallbackUrl();

  persistPendingSocialAuth({
    provider: params.provider,
    state,
    nonce,
    country: params.country,
    marketingConsent: params.marketingConsent,
    callbackUrl,
  });

  if (params.provider === 'google') {
    const clientId = getGoogleClientId();
    if (!clientId) {
      throw new Error('Google client id is not configured');
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');
    window.location.assign(authUrl.toString());
    return;
  }

  const clientId = getAppleClientId();
  if (!clientId) {
    throw new Error('Apple client id is not configured');
  }

  const authUrl = new URL('https://appleid.apple.com/auth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code id_token');
  authUrl.searchParams.set('response_mode', 'fragment');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  window.location.assign(authUrl.toString());
};

export const parseSocialCallback = (): SocialCallbackParams => {
  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);

  return {
    idToken: params.get('id_token'),
    state: params.get('state'),
    error: params.get('error'),
  };
};

export const validateSocialCallback = (
  pending: PendingSocialAuth | null,
  callback: SocialCallbackParams
) => {
  if (!pending) {
    return { isValid: false, reason: 'missing_pending_auth' };
  }

  if (callback.error) {
    return { isValid: false, reason: callback.error };
  }

  if (!callback.idToken || !callback.state) {
    return { isValid: false, reason: 'missing_callback_params' };
  }

  if (pending.state !== callback.state) {
    return { isValid: false, reason: 'invalid_state' };
  }

  const payload = parseJwtPayload(callback.idToken);
  if (!payload || payload.nonce !== pending.nonce) {
    return { isValid: false, reason: 'invalid_nonce' };
  }

  return { isValid: true };
};
