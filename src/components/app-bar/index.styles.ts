import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  z-index: ${theme.zIndex.appBar};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  height: 52px;
  margin: 0 auto;

  background-color: transparent;
`;

export const wrapperWithBackground = css`
  position: relative;
  z-index: ${theme.zIndex.appBar};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  height: 52px;
  margin: 0 auto;

  background-color: ${theme.colors.bg_default};
`;

export const contents = css`
  display: flex;
  align-items: center;
  position: relative;

  width: 100%;
  height: 100%;
  padding-left: 16px;
`;

export const center = css`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  white-space: nowrap;
`;

export const backButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;
  border-radius: 50%;

  background-color: ${theme.colors.primary50Opacity60};

  transition: opacity 0.25s ease;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;
