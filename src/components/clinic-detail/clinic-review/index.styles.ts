import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: hidden;
  gap: 16px;

  background: ${theme.colors.bg_surface1};
  h1 {
    margin: 0 20px;
  }
`;

export const reviewSummary = css`
  display: flex;
  flex-direction: column;
  margin: 20px 20px 0;
  padding: 12px 16px;
  border-radius: 8px;
  gap: 8px;
  background: ${theme.colors.white};
`;

export const titleWrapper = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;
export const title = css`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;
`;

export const toolTip = css`
  display: flex;
  position: relative;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;

  cursor: pointer;

  &:hover > div {
    opacity: 1;
    visibility: visible;
  }
`;

export const toolTipInfo = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 2;
  visibility: hidden;

  width: min(320px, calc(100vw - 40px));
  max-width: 320px;
  padding: 16px;
  border-radius: 8px;

  background-color: white;
  box-shadow: 0 0 6px rgb(0 0 6 / 10%);

  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
  opacity: 0;
`;

export const list = css`
  padding-left: 16px;
  margin: 0;

  li {
    margin-bottom: 4px;
    list-style-type: disc;
  }
`;
export const content = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  width: 100%;
  height: 100%;
  padding: 0 20px 20px;
  border-top: 1px solid ${theme.colors.gray200};
`;

export const count = css`
  padding: 12px 16px;
  border-radius: 8px;
  background: ${theme.colors.white};
`;
export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
