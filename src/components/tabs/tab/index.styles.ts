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

  width: 90px;
  height: 3px;
  margin: 0 auto;
  border-radius: 2px 2px 0 0;

  background: ${theme.colors.primary50};
`;
