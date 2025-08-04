import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Size } from './index.types';

export const wrapper = ({ disabled, size }: { disabled: boolean; size: Size }) => css`
  ${!disabled &&
  css`
    transition: all 0.25s ease;
  `}

  ${disabled &&
  css`
    background: ${theme.colors.gray300} !important;
    color: ${theme.colors.gray500} !important;

    cursor: default;
  `}

  ${size === 'S' &&
  css`
    padding: 4px 10px;
  `}


  ${size === 'M' &&
  css`
    padding: 6px 10px;
  `}
  width: fit-content;
  height: fit-content;
  border-radius: 20px;

  background: ${theme.colors.gray100};
  color: ${theme.colors.gray600};

  ${theme.typo.body5};
`;
