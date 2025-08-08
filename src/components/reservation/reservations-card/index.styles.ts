import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;

  width: 100%;
  padding: 12px 12px 12px 18px;
  border-radius: 0 65px 65px 0;

  background: ${theme.colors.white};

  cursor: pointer;

  img {
    border-radius: 50%;
  }
`;

export const infoWrapper = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  gap: 4px;

  width: 100%;
`;

export const top = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const image = css`
  border-radius: 50%;
  object-fit: cover;

  background-color: ${theme.colors.gray200};
`;
