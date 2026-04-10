import { theme } from '@/styles';
import { css } from '@emotion/react';

export const infoWrapper = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;

  padding: 9px;
  border-radius: 12px;

  background-color: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
  align-self: stretch;
`;

export const itemWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const programTitleRow = css`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const itemImage = css`
  flex-shrink: 0;

  width: 80px;
  min-width: 80px;
  height: 80px;
  min-height: 80px;
  border-radius: 12px;
  object-fit: cover;
`;

export const programDetails = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const detailRow = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const separator = css`
  width: 1px;
  height: 12px;
  margin: 0 4px;

  background-color: ${theme.colors.text_secondary};
`;

export const discountPriceGroup = css`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
`;

export const discountRateBadge = css`
  display: inline-flex;
  align-items: center;

  height: 16px;
  padding: 0 4px;
  border-radius: 4px;

  background: ${theme.colors.red200};
  color: ${theme.colors.white};
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
`;

export const originalPriceText = css`
  color: ${theme.colors.text_disabled};
  text-decoration: line-through;
`;

export const discountedPriceText = css`
  color: ${theme.colors.red200};
  font-weight: 500;
`;
