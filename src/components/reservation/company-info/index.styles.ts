import { css } from '@emotion/react';
import { theme } from '@/styles';

export const card = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  margin: 12px 16px 8px;
  padding: 24px 18px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};

  @media (min-width: ${theme.breakpoints.desktop}) {
    margin: 0;
  }
`;

export const titleRow = css`
  display: flex;
  align-items: flex-start;
  gap: 8px;

  min-width: 0;
`;

export const titleText = css`
  flex: 1 1 auto;

  min-width: 0;

  line-height: 1.25;
  white-space: normal;
`;

export const discountBadge = css`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  align-self: flex-start;

  height: 18px;
  padding: 0 5px;
  border-radius: 4px;

  background: ${theme.colors.red200};
  color: ${theme.colors.white};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
`;

export const locationRow = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const locationIcon = css`
  display: inline-flex;
  flex: 0 0 16px;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  svg {
    display: block;

    width: 16px;
    height: 16px;
  }
`;

export const tagList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const tagChip = (variant: 'reservation' | 'payment') => css`
  display: flex;
  align-items: center;

  padding: ${variant === 'payment' ? '4px 6px' : '6px 12px'};
  border-radius: ${variant === 'payment' ? '4px' : '16px'};

  background: ${theme.colors.primary10Opacity40};
`;
