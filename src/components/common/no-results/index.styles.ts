import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px 0;
  width: 100%;
  height: 80%;

  line-height: 1.4;
  text-align: center;
  background-color: ${theme.colors.primary0};
`;

export const iconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.primary70};
`;

export const icon = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.primary70};
`;

export const textContainer = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
