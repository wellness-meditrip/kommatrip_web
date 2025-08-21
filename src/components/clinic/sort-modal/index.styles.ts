import { css } from '@emotion/react';
import { theme } from '@/styles';

export const overlay = css`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;

  max-width: 480px;
  margin: 0 auto;

  background-color: rgba(0, 0, 0, 0.5);
`;

export const modal = css`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;

  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 20px 32px;
  border-radius: 20px 20px 0 0;

  background-color: ${theme.colors.white};
`;

export const handle = css`
  width: 40px;
  height: 4px;
  margin: 0 auto 24px;
  border-radius: 2px;

  background-color: ${theme.colors.gray300};
`;

export const content = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const sortOption = (isSelected: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  padding: 16px 20px;
  border: none;

  background: none;
  text-align: left;

  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.gray100};
  }
`;
