import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  width: 100%;
`;

export const tabHeader = css`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;

  background: ${theme.colors.bg_default};
  border-bottom: 1px solid ${theme.colors.gray300};

  cursor: pointer;

  /* 스크롤 성능 최적화 */
  will-change: transform;
  backdrop-filter: blur(8px);
`;

export const tabContent = css`
  display: flex;
  position: relative;

  width: 100%;
  min-height: 100vh; /* 최소 높이 설정으로 높이 차이 문제 해결 */
`;

export const tabContentItem = css`
  width: 100%;
`;
