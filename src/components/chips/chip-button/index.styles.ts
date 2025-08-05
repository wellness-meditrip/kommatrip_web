import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = ({ disabled }: { disabled: boolean }) => css`
  ${disabled &&
  css`
    background: ${theme.colors.gray200} !important;
    color: ${theme.colors.gray400} !important;

    cursor: default;
  `}
  padding: 9px 12px;
  border: 0.7px solid ${disabled ? theme.colors.gray400 : theme.colors.black};
  border-radius: 15px;

  background: ${theme.colors.white};
  color: ${theme.colors.black};

  ${theme.typo.body12};
`;
