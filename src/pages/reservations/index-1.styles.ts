import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow-y: scroll;

  width: 100%;
  height: 100%;
  padding: 12px 18px calc(${theme.size.gnbHeight} + 18px) 0;
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
