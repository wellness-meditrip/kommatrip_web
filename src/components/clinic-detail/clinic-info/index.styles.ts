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

export const operatingWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 6px;

  padding-top: 6px;
`;

export const urlWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding-top: 8px;
`;

export const contents = css`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 24px 20px;
`;

export const itemWrapper = css`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

export const item = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const textWrapper = css`
  white-space: nowrap;
`;
