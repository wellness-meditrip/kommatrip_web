import { css } from '@emotion/react';

export const container = css`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: scroll;

  width: 100%;
  height: 100%;
  padding: 0 0 30px;
`;

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  padding: 24px 24px 12px;
  align-self: stretch;
`;

export const item = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;
