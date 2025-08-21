import { css } from '@emotion/react';

export const container = css`
  border-bottom: 1px solid #eee;

  padding: 16px 0;
`;

export const rowHeader = css`
  display: flex;
  align-items: center;
  gap: 20px;

  cursor: pointer;
`;

export const iconWrapper = css`
  display: flex;
  align-items: center;

  margin: 0 20px;
`;
export const buttonWrapper = (isOpen: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${isOpen ? 180 : 0}deg);
`;

export const titleWrapper = css`
  gap: 16px;
`;

export const detailWrapper = css`
  display: flex;
  flex-direction: column;

  margin-left: 76px;
`;
