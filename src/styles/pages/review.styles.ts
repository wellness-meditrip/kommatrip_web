import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;

  background-color: ${theme.colors.bg_surface1};
`;
export const image = css`
  border: 1px solid ${theme.colors.gray200};
  border-radius: 8px;

  background-color: black;
`;
export const content = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const item = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;
export const header = css`
  display: flex;
  gap: 12px;

  margin-bottom: 6px;
  padding: 18px;

  background-color: ${theme.colors.white};
`;

export const container = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  min-height: calc(100vh - ${theme.size.gnbHeight});
  padding: 16px 18px 18px;
`;

export const submitButton = css`
  margin-top: 14px;
  padding: 18px;
`;
