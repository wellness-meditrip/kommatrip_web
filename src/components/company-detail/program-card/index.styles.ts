import { theme } from '@/styles';
import { css } from '@emotion/react';

export const infoWrapper = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;

  padding: 9px;
  border-radius: 12px;

  background-color: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
  align-self: stretch;
`;

export const itemWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const itemImage = css`
  width: 80px;
  height: 80px;
  border-radius: 12px;
`;

export const programDetails = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const detailRow = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const separator = css`
  width: 1px;
  height: 12px;
  margin: 0 4px;

  background-color: ${theme.colors.text_secondary};
`;
