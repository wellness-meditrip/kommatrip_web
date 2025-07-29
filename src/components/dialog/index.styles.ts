import { css } from '@emotion/react';
import theme from '@/styles/theme';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 29px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${theme.zIndex.dialog};

  width: 291px;
  padding: 40px 0 0;
  border-radius: 20px;

  background: ${theme.colors.white};
`;

export const text = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  width: 100%;
  padding: 0 18px;

  text-align: center;
  white-space: pre-line;
`;

export const buttonWrapper = css`
  display: flex;
  gap: 8px;

  width: 100%;
`;

export const button = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  padding: 20px 0;

  cursor: pointer;
`;
