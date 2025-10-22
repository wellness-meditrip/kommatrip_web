import { css } from '@emotion/react';

export const rowHeader = css`
  display: flex;
  align-items: center;
  gap: 16px;

  cursor: pointer;
`;

export const iconWrapper = css`
  display: flex;
  align-items: center;
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
