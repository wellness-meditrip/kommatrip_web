import { css } from '@emotion/react';
import { theme } from '@/styles';

export const section = css`
  position: relative;
  overflow: hidden;

  width: 100%;
  min-height: 520px;
  background-size: cover;
  background-position: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    min-height: 560px;
  }
`;

export const slides = css`
  position: absolute;
  transform: translate3d(0, 0, 0);
  z-index: 1;
  inset: 0;
  transition-duration: 0ms;
`;

export const slide = (isActive: boolean) => css`
  position: absolute;
  inset: 0;
  opacity: ${isActive ? 1 : 0};

  transition: opacity 600ms ease;
`;

export const image = css`
  object-fit: cover;
  object-position: center;
`;

export const overlay = css`
  position: absolute;
  inset: 0;

  background: linear-gradient(
    180deg,
    rgb(10 18 16 / 70%) 0%,
    rgb(10 18 16 / 25%) 45%,
    rgb(10 18 16 / 75%) 100%
  );
`;

export const content = css`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;

  height: 100%;
`;

export const headerOverlay = css`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 3;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 100%;
  }
`;

export const searchBarWrapper = css`
  width: 100%;
  margin: 0 auto;
`;

export const heroContent = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 12px;

  padding: 0 20px 28px;

  text-align: left;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 100%;
    padding: 0 80px 48px;
  }
`;

export const heroTitle = css`
  color: ${theme.colors.white};
  font-size: 3.25rem;
  font-weight: 600;
  line-height: 4.25rem;
  letter-spacing: -0.02em;
  text-shadow: 0 0 8px rgb(0 0 0 / 25%);
  word-break: keep-all;

  @media (max-width: 1024px) {
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.625rem;
    letter-spacing: -0.01em;
    text-shadow: 0 0 4px rgb(0 0 0 / 25%);
  }

  @media (max-width: 480px) {
    font-size: 1.625rem;
    font-weight: 700;
    line-height: 2.25rem;
    letter-spacing: -0.01em;
  }
`;

export const heroSubtitle = css`
  color: ${theme.colors.white};
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 2rem;
  letter-spacing: -0.01em;
  text-shadow: 0 0 6px rgb(0 0 0 / 25%);
  word-break: keep-all;

  @media (max-width: 1024px) {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.625rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5rem;
  }
`;

export const progressRow = css`
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  margin-top: 8px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    gap: 0;
    position: absolute;
    bottom: 0;
    left: 0;

    margin-top: 0;
    padding: 0 0 0.5px;
  }
`;

export const progressTrack = css`
  flex: 1;
  position: relative;

  height: 1px;

  background: rgb(255 255 255 / 35%);

  @media (min-width: ${theme.breakpoints.desktop}) {
    height: 2px;
  }
`;

export const progressFill = (ratio: number) => css`
  width: ${Math.min(Math.max(ratio, 0), 1) * 100}%;
  height: 100%;

  background: ${theme.colors.white};

  transition: width 350ms ease;
`;

export const progressCount = css`
  color: ${theme.colors.white};
  font-size: 12px;
  letter-spacing: 1px;
`;
