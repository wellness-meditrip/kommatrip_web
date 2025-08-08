import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  position: relative;
  display: inline-block;
  width: 100%;
`;

export const dateInput = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
`;

export const calendarButton = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 30px;
  background-color: ${theme.colors.white};
  font-size: 13px;
  color: ${theme.colors.text_tertiary};
  cursor: pointer;
  min-height: 52px;
  z-index: 2;
  position: relative;

  &:hover {
    border-color: ${theme.colors.primary50};
  }

  &:active {
    background-color: ${theme.colors.bg_surface1};
  }
`;

export const calendarIcon = css`
  font-size: 16px;
  margin-left: 8px;
`;
