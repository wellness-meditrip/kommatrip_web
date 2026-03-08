import { css } from '@emotion/react';

export const wrapper = (fullHeight?: boolean) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;

  width: 100%;
  height: ${fullHeight ? '100%' : '80%'};
  ${fullHeight &&
  `
    min-height: 100%;
    flex: 1;
  `}
  line-height: 1.4;
  text-align: center;
`;
