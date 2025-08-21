import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  overflow-y: auto;

  width: 100%;
  height: 100%;
  padding: 104px 20px 80px;

  background-color: ${theme.colors.bg_surface1};
`;

export const wrapperNoPadding = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  overflow-y: auto;

  width: 100%;
  height: 100%;
  padding: 80px 0 80px;

  background-color: ${theme.colors.bg_surface1};
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
