import type { ToastProps } from '@/components/toast';

type ToastPayload = Omit<ToastProps, 'isShow'>;
type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export const emitToast = (payload: ToastPayload) => {
  listeners.forEach((listener) => listener(payload));
};

export const subscribeToast = (listener: ToastListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
