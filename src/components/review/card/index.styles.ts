import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  padding: 18px;
  border-radius: 21px;

  background: ${theme.colors.white};
`;

export const userImage = css`
  width: 33px;
  height: 33px;
  object-fit: cover;

  border-radius: 50px;
`;

export const userInfo = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 7px;
`;

export const reviewerInfo = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-right: 5px;
  margin-bottom: 13px;
`;

export const reviewImages = css`
  display: flex;
  gap: 6px;
  overflow-x: auto;

  margin-bottom: 8px;
  padding: 5px 1px;
  -webkit-overflow-scrolling: touch;

  img {
    width: 101px;
    height: 101px;
    object-fit: cover;

    border-radius: 10px;
  }
`;

export const tagsContainer = css`
  display: flex;
  gap: 6px;

  margin-bottom: 12px;
`;

export const tagsWrapper = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  width: 100%;
  margin: 13px 0 0;
  margin: 11px 0 0;
`;

export const tagWrapper = css`
  display: flex;

  padding: 4px 12px;
  border: 1px solid ${theme.colors.blue200};
  border-radius: 14px;

  background: ${theme.colors.blue100};
`;

export const tags = css`
  padding: 3px 10px;
  border: 0.5px solid ${theme.colors.green200};
  border-radius: 14px;

  background-color: ${theme.colors.green100};
`;

export const reportButton = css`
  padding: 6px 10px;
  border-radius: 20px;
  ${theme.typo.body7};
  background-color: ${theme.colors.gray100};
  color: ${theme.colors.gray600};

  cursor: pointer;
`;

export const contentContainer = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: 12px 0 6px;
`;

export const contentStyle = (flagged: boolean, isUnrolled: boolean) => css`
  display: -webkit-box;
  overflow: hidden;

  width: ${flagged && !isUnrolled ? '80%' : '100%'};

  white-space: normal;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
`;

export const contentUnrolled = css`
  display: block;
  -webkit-line-clamp: unset;
`;

export const unroll = css`
  display: flex;
  justify-content: center;

  width: 100%;
  padding: 18px 18px 0;
`;

export const report = css`
  display: flex;

  padding: 18px 0 10px;
`;
