import { ROUTES } from '@/constants';
import { useUiStore, type LoginModalReason } from '@/store/ui';
import { resolveSafeAuthRedirect } from '@/utils/auth-session';

const LOGIN_MODAL_BLOCKED_PATHS = new Set([ROUTES.LOGIN, ROUTES.SIGNUP, '/auth/social/callback']);

const getPathname = (value: string) => value.split('?')[0]?.split('#')[0] ?? value;

export const resolveCurrentAuthCallbackUrl = (fallback = ROUTES.HOME) => {
  if (typeof window === 'undefined') return fallback;

  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return resolveSafeAuthRedirect(currentUrl, fallback);
};

export const shouldSkipLoginModal = (callbackUrl: string) => {
  return LOGIN_MODAL_BLOCKED_PATHS.has(getPathname(callbackUrl));
};

export const openLoginModal = (options?: {
  callbackUrl?: string;
  dismissRedirectUrl?: string | null;
  reason?: LoginModalReason | null;
}) => {
  const callbackUrl = resolveSafeAuthRedirect(
    options?.callbackUrl ?? resolveCurrentAuthCallbackUrl(),
    ROUTES.HOME
  );

  if (shouldSkipLoginModal(callbackUrl)) {
    return;
  }

  useUiStore.getState().openLoginModal({
    callbackUrl,
    dismissRedirectUrl: options?.dismissRedirectUrl,
    reason: options?.reason,
  });
};
