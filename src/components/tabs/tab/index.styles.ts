import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 100%;
  padding: 10px 0;

  text-align: center;
`;

export const bar = css`
  position: absolute;
  bottom: 0;

  width: 100px;
  height: 2px;
  margin: 0 auto;

  background: ${theme.colors.primary50};
`;
