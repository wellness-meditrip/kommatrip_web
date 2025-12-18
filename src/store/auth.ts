import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  // setAccessToken: (token) => set({ accessToken: token }),
  // clearAuth: () => set({ accessToken: null }),

  setAccessToken: (token) => {
    console.log('[AuthStore] setAccessToken called', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    });
    set({ accessToken: token });
    // 저장 후 현재 상태 확인
    console.log('[AuthStore] Current accessToken in store:', {
      hasToken: !!token,
      tokenLength: token?.length,
    });
  },
  clearAuth: () => {
    console.log('[AuthStore] clearAuth called - removing accessToken from memory');
    set({ accessToken: null });
  },
}));
