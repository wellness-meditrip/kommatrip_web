import { css } from '@emotion/react';
import { theme } from '@/styles';

export const categoryGrid = css`
  display: grid;
  gap: 8px;

  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

export const categoryButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  width: 100%;
  min-width: 0;
  height: 80px;
  padding: 8px;
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

export const categoryLabel = css`
  display: block;

  width: 100%;
  min-width: 0;

  line-height: 1.25;
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
`;
