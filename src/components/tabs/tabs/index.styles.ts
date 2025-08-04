import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  overflow-y: hidden;

  width: 100%;
  height: 100%;
  padding: 0 0 36px;
`;

export const tabHeader = css`
  display: flex;

  cursor: pointer;

  border-bottom: 0.5px solid ${theme.colors.gray500};
`;

export const tabContent = css`
  display: flex;
  position: relative;
  overflow-y: auto;

  width: 100%;
  height: 100%;
`;

export const tabContentItem = css`
  position: absolute;
  top: 0;

  width: 100%;
  height: 100%;
`;
