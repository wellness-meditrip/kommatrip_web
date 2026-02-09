import { useCallback } from 'react';
import { useToast, useDialog } from '@/hooks';
import { getToastMessage, normalizeError } from '@/utils/error-handler';

interface ToastOptions {
  fallbackMessage?: string;
  overrideMessage?: string;
  icon?: 'check' | 'exclaim';
}

interface DialogOptions {
  title: string;
  fallbackMessage?: string;
  overrideMessage?: string;
  primaryActionLabel: string;
}

export const useErrorHandler = () => {
  const { showToast } = useToast();
  const { open } = useDialog();

  const showErrorToast = useCallback(
    (error: unknown, options?: ToastOptions) => {
      const title = getToastMessage(error, {
        fallbackMessage: options?.fallbackMessage,
        overrideMessage: options?.overrideMessage,
      });
      showToast({ title, icon: options?.icon ?? 'exclaim' });
    },
    [showToast]
  );

  const showErrorDialog = useCallback(
    (error: unknown, options: DialogOptions) => {
      const description = getToastMessage(error, {
        fallbackMessage: options.fallbackMessage,
        overrideMessage: options.overrideMessage,
      });
      open({
        type: 'confirm',
        title: options.title,
        description,
        primaryActionLabel: options.primaryActionLabel,
      });
    },
    [open]
  );

  return { showErrorToast, showErrorDialog, normalizeError };
};
