import { css } from '@emotion/react';
import { theme } from '@/styles';

export type ToastVariant = 'default' | 'watching';

const toastBase = css`
  display: flex;
  align-items: center;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${theme.zIndex.toast};
`;

const defaultToast = css`
  gap: 6px;
  bottom: calc(${theme.size.gnbHeight} + 18px);

  width: calc(100% - 18px - 18px);
  max-width: calc(${theme.size.maxWidth} - 18px - 18px);
  padding: 10px;
  border-radius: 18px;

  background: ${theme.colors.grayOpacity400};
`;

const watchingToast = css`
  gap: 8px;
  bottom: calc(${theme.size.ctaButtonHeight} + 20px);

  width: fit-content;
  max-width: calc(100% - 20px - 20px);
  padding: 11px 18px;
  border: 2px solid ${theme.colors.primary50};
  border-radius: 999px;

  background: ${theme.colors.white};
  box-shadow: 0 10px 24px ${theme.colors.shadow_default};

  @media (min-width: ${theme.breakpoints.desktop}) {
    bottom: 32px;
  }
`;

export const toastContainer = (variant: ToastVariant) => [
  toastBase,
  variant === 'watching' ? watchingToast : defaultToast,
];

export const watchingIcon = css`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.primary50};
`;

export const watchingTitle = css`
  color: ${theme.colors.primary50};
  ${theme.typo.body4};
  line-height: 1;
  white-space: nowrap;
`;
