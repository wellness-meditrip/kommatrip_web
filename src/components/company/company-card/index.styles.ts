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

export const wrapperFixedHeight = css`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 320px;
  border-radius: 12px;

  background-color: ${theme.colors.white};

  cursor: pointer;
`;

export const profileWrapper = css`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;

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

  padding: 16px;
`;

export const DetailsWrapperFixedHeight = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;

  height: 120px;
  padding: 16px;
`;

export const address = css`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    flex-shrink: 0;
  }
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const tagsFixedHeight = css`
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  gap: 6px;
`;

export const ratingBadge = css`
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  top: 8px;
  left: 8px;

  padding: 4px 8px;
  border-radius: 12px;

  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

export const star = css`
  font-size: 12px;
`;

export const ratingText = css`
  font-size: 12px;
  font-weight: bold;
`;
