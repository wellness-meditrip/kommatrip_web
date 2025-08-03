import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: scroll;

  width: 100%;
  height: 100%;
  padding: 0 20px;
`;

export const url = css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  cursor: pointer;
`;
