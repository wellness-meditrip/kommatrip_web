import { theme } from '@/styles';
import { css } from '@emotion/react';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  overflow-y: hidden;

  height: 100%;

  h1 {
    margin: 0 20px;
  }
`;

export const reviewSummary = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  margin: 20px 20px 0;
  padding: 12px 16px;
  border-radius: 8px;

  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

export const titleWrapper = css`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
`;
export const title = css`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;

  min-width: 0;
`;

export const toolTip = css`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  position: relative;

  min-width: 0;
  margin-left: auto;

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
  margin: 0;
  padding-left: 16px;

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
  padding: 20px;
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
