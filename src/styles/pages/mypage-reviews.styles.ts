import { theme } from '@/styles';
import { css } from '@emotion/react';

export const pageWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  min-height: calc(100vh - ${theme.size.gnbHeight});
  padding: 20px 16px 120px;

  background: ${theme.colors.bg_surface1};
`;

export const countCard = css`
  padding: 14px 16px;
  border-radius: 12px;

  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
  text-align: center;
`;

export const reviewList = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const emptyState = css`
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 200px;

  text-align: center;
`;

export const sheetOverlay = css`
  position: fixed;
  z-index: ${theme.zIndex.actionSheet};

  background: rgb(0 0 0 / 45%);
  inset: 0;
`;

export const sheetContainer = css`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${theme.zIndex.actionSheet + 1};

  padding: 16px 18px 28px;
  border-radius: 24px 24px 0 0;

  background: ${theme.colors.white};

  animation: slide-up 0.25s ease-out;

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }
`;

export const sheetHandle = css`
  width: 44px;
  height: 4px;
  margin: 0 auto 18px;
  border-radius: 999px;

  background: ${theme.colors.gray300};
`;

export const sheetList = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const sheetButton = css`
  padding: 14px 12px;
  border: none;
  border-radius: 12px;

  background: transparent;
  text-align: center;

  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg_surface1};
  }
`;
