import { css } from '@emotion/react';
import { theme } from '@/styles';

export const container = css`
  width: 100%;
  margin-bottom: 32px;
`;

export const header = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 16px;
`;

export const title = css`
  font-weight: 600;
`;

export const button = css`
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

export const wrapper = css`
  display: flex;
  align-items: center;
  position: relative;
`;

export const scrollContainer = css`
  flex: 1;
  overflow: auto hidden;

  height: 480px;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const grid = css`
  display: flex;
  gap: 16px;

  width: max-content;
  padding: 0 0 8px;
`;

export const leftButton = css`
  @media (max-width: 1024px) {
    display: none;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: -20px;
  transform: translateY(-50%);
  z-index: 30;

  width: 40px;
  height: 40px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 50%;

  background-color: rgb(255 255 255 / 90%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.white};
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

export const rightButton = css`
  @media (max-width: 1024px) {
    display: none;
  }
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  z-index: 30;

  width: 40px;
  height: 40px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 50%;

  background-color: rgb(255 255 255 / 90%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.white};
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

export const scrollButtons = css`
  display: none;
  justify-content: center;
  gap: 12px;

  margin-top: 16px;

  @media (min-width: 1024px) {
    display: flex;
  }
`;
