import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  width: 100%;
  height: 80%;
  padding: 32px 0;

  background-color: ${theme.colors.bg_surface1};
  line-height: 1.4;
  text-align: center;
`;

export const iconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 60px;
  height: 60px;
  border: 2px solid ${theme.colors.primary70};
  border-radius: 50%;
`;

export const icon = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  color: ${theme.colors.primary70};
  font-size: 24px;
  font-weight: bold;
`;

export const textContainer = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
