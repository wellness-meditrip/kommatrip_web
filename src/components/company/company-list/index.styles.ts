import { css } from '@emotion/react';
import { theme } from '@/styles';

export const container = css`
  width: 100%;
  margin-bottom: 32px;
`;

export const header = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 16px;
`;

export const title = css`
  font-weight: 600;
`;

export const button = css`
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

export const scrollContainer = css`
  overflow-x: auto;
  overflow-y: hidden;

  /* 스크롤바 숨기기 */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const grid = css`
  display: flex;
  gap: 16px;

  width: max-content;
  padding: 0 0 8px 0;
`;
