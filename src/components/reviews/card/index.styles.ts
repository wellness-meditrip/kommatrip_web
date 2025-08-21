import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  padding: 16px;
  border-radius: 8px;

  background: ${theme.colors.white};
`;

export const reviewerInfo = css`
  display: flex;
  align-items: center;
  gap: 8px;

  img,
  svg {
    border-radius: 50%;
    object-fit: cover;
  }
`;

export const top = css`
  display: flex;
  align-items: center;
  gap: 8px;

  border-radius: 12px;

  background-color: #fff;
`;

export const reviewContent = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;

  min-width: 0;
`;

export const imageWrapper = css`
  display: flex;
  gap: 6px;
  overflow-x: auto;

  width: 100%;
  margin: 16px 0 0;

  img {
    border-radius: 4px;

    background: ${theme.colors.bg_default};
  }
`;

export const contentWrapper = css`
  margin: 16px 0 0;
`;
export const tagsWrapper = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  width: 100%;
`;

export const tagWrapper = css`
  display: flex;

  padding: 4px 8px;
  border-radius: 4px;

  background: ${theme.colors.bg_surface2};
`;

export const clampText = css`
  display: -webkit-box;
  overflow: hidden;

  margin: 16px 0 0;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
`;
