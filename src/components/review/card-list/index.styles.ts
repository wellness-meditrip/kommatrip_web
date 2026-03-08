import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow-y: scroll;

  width: 100%;
  height: 100%;
  padding: 14px 18px;
`;

export const empty = css`
  margin-top: 200px;
`;
