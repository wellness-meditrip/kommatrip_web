import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: fit-content;
  border-radius: 12px;

  background-color: ${theme.colors.white};

  cursor: pointer;
`;

export const profileWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 280px;

  svg,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const profileImage = css`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const DetailsWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 16px 20px;
`;

export const address = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
