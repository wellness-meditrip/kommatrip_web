import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: inline-block;
  position: relative;

  width: 100%;
`;

export const dateInput = css`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
`;

export const calendarButton = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;

  min-height: 52px;
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 30px;

  background-color: ${theme.colors.white};
  color: ${theme.colors.text_tertiary};
  font-size: 13px;

  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary50};
  }

  &:active {
    background-color: ${theme.colors.bg_surface1};
  }
`;

export const calendarIcon = css`
  margin-left: 8px;

  font-size: 16px;
`;
