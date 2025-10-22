import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 353px;
  height: 440px;
  border-radius: 12px;

  background-color: ${theme.colors.white};

  cursor: pointer;

  > div:last-child {
    margin-top: auto;
  }
`;

export const wrapperFixedHeight = css`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 353px;
  height: 440px;
  border-radius: 12px;

  background-color: ${theme.colors.white};

  cursor: pointer;

  > div:last-child {
    margin-top: auto;
  }
`;

export const profileWrapper = css`
  flex: 1;
  position: relative;
  overflow: hidden;

  width: 100%;
  border-radius: 12px 12px 0 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const profileImage = css`
  width: 100%;
  height: 100%;
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
  top: 12px;
  left: 12px;

  width: fit-content;
  padding: 6px;
  border-radius: 12px;

  background-color: ${theme.colors.bg_default};
  color: ${theme.colors.text_secondary};
`;
