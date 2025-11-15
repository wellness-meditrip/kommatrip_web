import { css } from '@emotion/react';
import { theme } from '@/styles';

export const categoryGrid = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  gap: 8px;
`;

export const categoryButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 80px;
  border: none;
  border-radius: 8px;

  background-color: ${theme.colors.primary10Opacity20};

  transition: all 0.2s ease;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const selectedCategory = css`
  background-color: ${theme.colors.primary10Opacity60} !important;
`;

export const categoryName = css`
  margin: 0 0 4px;
`;
