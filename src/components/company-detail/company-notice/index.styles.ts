import { css } from '@emotion/react';
export {
  wrapper as noticeWrapper,
  infoWrapper as noticeInfoWrapper,
} from '../company-info/index.styles';

export const noticeTextBlock = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const noticeContent = css`
  line-height: 1.3;
  white-space: pre-wrap;
`;

export const noticeRow = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

export const titleWrapper = css`
  margin: 0 0 12px;
`;
