let authReadyPromise: Promise<void> | null = null;
let resolveAuthReady: (() => void) | null = null;
let rejectAuthReady: ((error: unknown) => void) | null = null;

export const beginAuthRefresh = () => {
  if (!authReadyPromise) {
    authReadyPromise = new Promise<void>((resolve, reject) => {
      resolveAuthReady = resolve;
      rejectAuthReady = reject;
    });
  }
  return authReadyPromise;
};

export const resolveAuthRefresh = () => {
  resolveAuthReady?.();
  authReadyPromise = null;
  resolveAuthReady = null;
  rejectAuthReady = null;
};

export const rejectAuthRefresh = (error: unknown) => {
  rejectAuthReady?.(error);
  authReadyPromise = null;
  resolveAuthReady = null;
  rejectAuthReady = null;
};

export const waitForAuthReady = () => authReadyPromise ?? Promise.resolve();

export const isAuthRefreshInFlight = () => !!authReadyPromise;
