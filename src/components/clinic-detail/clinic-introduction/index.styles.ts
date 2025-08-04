import { css } from '@emotion/react';
import { theme } from '@/styles';

export const container = css`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: 12px 16px;
`;

export const header = (clickable: boolean) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${clickable && 'cursor: pointer;'}
`;

export const arrow = (isOpen: boolean) => css`
  width: 16px;
  height: 16px;
  transform: rotate(${isOpen ? 180 : 0}deg);
  transform-origin: center center;
`;

export const content = css`
  margin-top: 16px;
  display: flex;
  align-items: center;
  flex-direction: row;

  gap: 12px;
  white-space: pre-line;
  line-height: 1.6;
`;
