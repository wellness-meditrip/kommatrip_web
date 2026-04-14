import { css } from '@emotion/react';
import theme from '@/styles/theme';

export const wrapper = css`
  width: 100%;
  margin-top: auto;

  background: ${theme.colors.bg_surface1};
  border-top: 1px solid ${theme.colors.border_default};
`;

export const inner = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: 100%;
  max-width: ${theme.size.maxWidth};
  padding: 28px 20px calc(28px + ${theme.size.gnbHeight});

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 32px 28px;
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    gap: 20px;

    padding: 40px;
  }
`;

export const linkRow = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
`;

export const linkItem = css`
  color: ${theme.colors.text_tertiary};
  text-decoration: none;

  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.text_primary};
    text-decoration: underline;
  }
`;

export const infoList = css`
  display: grid;
  gap: 4px;
`;

export const copyright = css`
  margin-top: 6px;

  color: ${theme.colors.text_secondary};
  letter-spacing: 0.2px;
`;
