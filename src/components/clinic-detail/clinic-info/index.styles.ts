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
  gap: 10px 14px;
  justify-content: flex-start;
  cursor: pointer;
`;

export const contents = css`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${theme.colors.bg_surface1};
  padding: 16px 20px calc(${theme.size.ctaButtonHeight} + 16px) 20px;
`;

export const itemWrapper = css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  justify-content: flex-start;
`;
export const item = css`
  display: flex;
  align-items: center;
  flex-direction: column;

  flex-shrink: 0;
  min-width: 70px;
  gap: 8px;
`;

export const textWrapper = css`
  white-space: nowrap;
`;
