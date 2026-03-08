import { css } from '@emotion/react';
import { theme } from '@/styles';

export const container = css`
  padding: 12px 16px;
  border-radius: 8px;

  background-color: ${theme.colors.white};
`;

export const header = (clickable: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${clickable && 'cursor: pointer;'}
`;

export const arrow = (isOpen: boolean) => css`
  transform: rotate(${isOpen ? 180 : 0}deg);

  width: 16px;
  height: 16px;
  transform-origin: center center;
`;

export const content = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;

  margin-top: 16px;

  line-height: 1.6;
  white-space: pre-line;
`;
