import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = (props: { backgroundColor: string }) => css`
  flex-shrink: 0;
  position: relative;
  z-index: ${theme.zIndex.appBar};

  width: 100%;
  max-width: ${theme.size.maxWidth};
  height: 52px;
  margin: 0 auto;

  background-color: ${props.backgroundColor === 'white'
    ? theme.colors.white
    : props.backgroundColor === 'green'
      ? theme.colors.primary30
      : props.backgroundColor === 'bg_surface1'
        ? theme.colors.bg_surface1
        : 'transparent'};
`;

export const contents = css`
  display: flex;
  align-items: center;
  position: relative;

  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

export const center = css`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  white-space: nowrap;
`;

export const backButton = (props: { buttonType: string }) => css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  border-radius: 50%;

  background-color: ${props.buttonType === 'styled'
    ? theme.colors.primary50Opacity60
    : 'transparent'};

  transition: opacity 0.25s ease;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const rightButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  border-radius: 50%;

  background-color: transparent;

  transition: opacity 0.25s ease;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;
