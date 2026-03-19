import { create } from 'zustand';
import { ROUTES } from '@/constants';
import { resolveSafeAuthRedirect } from '@/utils/auth-session';

export type LoginModalReason =
  | 'header'
  | 'guard'
  | 'menu'
  | 'chatbot'
  | 'reserve'
  | 'session_expired';

interface OpenLoginModalOptions {
  callbackUrl?: string;
  dismissRedirectUrl?: string | null;
  reason?: LoginModalReason | null;
}

interface UiState {
  isLoginModalOpen: boolean;
  loginModalCallbackUrl: string;
  loginModalDismissRedirectUrl: string | null;
  loginModalReason: LoginModalReason | null;
  openLoginModal: (options?: OpenLoginModalOptions) => void;
  closeLoginModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoginModalOpen: false,
  loginModalCallbackUrl: ROUTES.HOME,
  loginModalDismissRedirectUrl: null,
  loginModalReason: null,

  openLoginModal: (options) =>
    set({
      isLoginModalOpen: true,
      loginModalCallbackUrl: resolveSafeAuthRedirect(options?.callbackUrl, ROUTES.HOME),
      loginModalDismissRedirectUrl: options?.dismissRedirectUrl
        ? resolveSafeAuthRedirect(options.dismissRedirectUrl, ROUTES.HOME)
        : null,
      loginModalReason: options?.reason ?? null,
    }),

  closeLoginModal: () =>
    set((prev) => ({
      ...prev,
      isLoginModalOpen: false,
      loginModalDismissRedirectUrl: null,
      loginModalReason: null,
    })),
}));
