import { css } from '@emotion/react';
import { theme } from '@/styles';

export const titleBlock = css`
  margin-bottom: 16px;
`;

export const horizontalList = css`
  display: flex;
  gap: 20px;
  overflow: hidden;

  width: 100%;
`;

export const gridList = css`
  display: grid;
  grid-template-columns: 1fr;

  gap: 24px;

  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 353px);

    justify-content: center;
  }
`;

export const companyCardSkeleton = css`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  width: 100%;
  max-width: 353px;
  height: 440px;
  border-radius: 12px;

  background-color: ${theme.colors.white};
`;

export const companyCardSkeletonCompact = css`
  min-width: 300px;
  height: 350px;
`;

export const companyImageSkeleton = css`
  width: 100%;
  height: 280px;
`;

export const companyImageSkeletonDefault = css`
  height: 356px;
`;

export const companyMeta = css`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 12px;
`;

export const companyMetaDefault = css`
  padding: 16px;
`;

export const tagRow = css`
  display: flex;
  gap: 8px;
`;

export const programList = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: 100%;
`;

export const programCard = css`
  display: flex;
  align-items: stretch;
  gap: 16px;

  width: 100%;
  padding: 12px;
  border-radius: 12px;

  background-color: ${theme.colors.white};
`;

export const programThumb = css`
  width: 120px;
  min-width: 120px;
  border-radius: 10px;
`;

export const programContent = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
`;

export const reviewList = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: 100%;
`;

export const reviewCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;
  padding: 16px;
  border-radius: 12px;

  background-color: ${theme.colors.white};
`;

export const reviewHeader = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const reviewTags = css`
  display: flex;
  gap: 8px;
`;
