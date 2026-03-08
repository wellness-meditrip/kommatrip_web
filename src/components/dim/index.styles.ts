import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = ({ fullScreen }: { fullScreen?: boolean }) =>
  fullScreen
    ? css`
        position: fixed;
        top: 0;
        left: 0;
        z-index: ${theme.zIndex.dim};
        overflow: hidden;

        width: 100%;
        height: 100vh;

        background: ${theme.colors.grayOpacity200};
      `
    : css`
        position: absolute;
        top: 0;
        left: 0;
        z-index: ${theme.zIndex.overlay};
        overflow: hidden;

        width: 100%;
        height: 100%;

        background: ${theme.colors.grayOpacity200};
      `;
