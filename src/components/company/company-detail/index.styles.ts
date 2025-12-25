import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;
  height: fit-content;
  border-radius: 12px;

  background-color: ${theme.colors.bg_default};

  cursor: pointer;

  @media (min-width: ${theme.breakpoints.desktop}) {
    flex-direction: row;
    align-items: center;
    gap: 24px;

    padding: 24px;
  }
`;

export const profileWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 100%;
  height: 280px;

  svg,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    flex: 0 0 420px;
    overflow: hidden;

    width: 420px;
    height: 260px;
    border-radius: 12px;
  }
`;

export const profileImage = css`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const carouselNavButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;

  background-color: rgb(255 255 255 / 90%);

  cursor: pointer;
`;

export const carouselNavLeft = css`
  left: 8px;
`;

export const carouselNavRight = css`
  right: 8px;

  svg {
    transform: rotate(180deg);
  }
`;

export const carouselDots = css`
  display: flex;
  gap: 4px;
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`;

export const carouselDot = css`
  width: 6px;
  height: 6px;
  padding: 0;
  border: none;
  border-radius: 50%;

  background-color: ${theme.colors.gray300};

  cursor: pointer;
`;

export const carouselDotActive = css`
  width: 6px;
  height: 6px;
  padding: 0;
  border: none;
  border-radius: 50%;

  background-color: ${theme.colors.primary50};

  cursor: pointer;
`;

export const DetailsWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 16px 20px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 0;
  }
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
