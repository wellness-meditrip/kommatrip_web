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

export const wrapperCompact = css`
  min-width: 300px;
  height: 350px;
`;

export const profileWrapper = css`
  flex: 1;
  position: relative;
  overflow: hidden;

  width: 100%;
  min-height: 200px;
  border-radius: 12px 12px 0 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const profileWrapperFixedHeight = css`
  ${profileWrapper};
  height: 356px;
  min-height: 356px;
`;

export const profileWrapperCompact = css`
  height: 280px;
  min-height: 280px;
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

  /* height: 120px; */
  padding: 16px;
`;

export const DetailsWrapperCompact = css`
  padding: 12px;
`;

export const DetailsWrapperFixedHeightCompact = css`
  padding: 12px;
`;

export const titleRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const titleText = css`
  flex: 1;
  overflow: hidden;

  min-width: 0;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const exclusiveBadge = css`
  display: inline-flex;
  align-items: center;

  padding: 2px 8px;
  border-radius: 999px;

  background-color: ${theme.colors.sub_sub_2};
  color: ${theme.colors.text_secondary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
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

export const imageCarousel = css`
  position: relative;

  width: 100%;
  height: 100%;
  touch-action: pan-y;

  &:hover button {
    opacity: 1;
  }
`;

export const carouselContainer = css`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 100%;
  border-radius: 12px 12px 0 0;
`;

export const carouselImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;

  border-radius: 12px 12px 0 0;
`;

export const carouselDots = css`
  display: flex;
  gap: 8px;
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
`;

const carouselDotBase = css`
  display: flex;

  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

export const carouselDot = css`
  ${carouselDotBase};
  background-color: rgb(255 255 255 / 72%);
`;

export const carouselDotActive = css`
  ${carouselDotBase};
  background-color: ${theme.colors.primary50};
`;

export const carouselNavButton = css`
  @media (max-width: 1024px) {
    display: none;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: 32px;
  height: 34px;

  transition: all 0.3s ease;

  cursor: pointer;
  opacity: 0;

  &:hover {
    opacity: 1;
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

export const carouselNavLeft = css`
  left: 7px;
`;

export const carouselNavRight = css`
  right: 7px;
`;
