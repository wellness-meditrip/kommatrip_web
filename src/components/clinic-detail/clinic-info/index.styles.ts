import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: scroll;

  width: 100%;
  height: 100%;
`;

export const infoWrapper = css`
  padding: 0 20px;
`;
export const urlWrapper = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px 14px;

  cursor: pointer;
`;

export const contents = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 16px 20px;
  padding: 16px 20px calc(${theme.size.ctaButtonHeight} + 16px) 20px;

  background: ${theme.colors.bg_surface1};
`;

export const itemWrapper = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px 14px;
`;
export const item = css`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;

  min-width: 70px;
`;

export const textWrapper = css`
  white-space: nowrap;
`;
