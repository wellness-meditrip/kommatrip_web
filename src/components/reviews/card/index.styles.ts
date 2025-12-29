import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  padding: 16px;
  border-radius: 8px;

  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
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
`;

export const programCard = css`
  display: flex;
  align-items: center;
  gap: 12px;

  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;

  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};

  cursor: pointer;
`;

export const programImage = css`
  flex-shrink: 0;

  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
`;

export const programInfo = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 6px;

  min-width: 0;
`;

export const programTitle = css`
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const programMetaRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const programMeta = css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const programArrow = css`
  flex-shrink: 0;
`;

export const reviewContent = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;

  min-width: 0;
`;

export const menuButton = css`
  margin-left: auto;
  padding: 4px;
  border: none;

  background: transparent;

  cursor: pointer;
`;

export const menuDots = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const menuDot = css`
  width: 4px;
  height: 4px;
  border-radius: 50%;

  background: ${theme.colors.gray400};
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

  background: ${theme.colors.primary10Opacity40};
`;

export const clampText = css`
  display: -webkit-box;
  overflow: hidden;

  margin: 16px 0 0;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
`;
