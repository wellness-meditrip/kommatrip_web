import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Size } from './index.types';
import { Service } from '../../../types';

export const chipRadio = ({
  isSelected,
  size,
  service,
}: {
  isSelected: boolean;
  size: Size;
  service: Service;
}) => css`
  display: flex;

  border-radius: 27.5px;

  transition: all 0.2s;

  cursor: pointer;

  ${chipSize({ size })}

  ${isSelected
    ? css`
        color: ${service === 'partner' ? theme.colors.green200 : theme.colors.blue200};
        background: ${service === 'partner' ? theme.colors.green100 : theme.colors.blue100};
        border: 1px solid ${service === 'partner' ? theme.colors.green200 : theme.colors.blue200};
      `
    : css`
        color: ${theme.colors.gray300};
        background: ${theme.colors.white};
        border: 1px solid ${theme.colors.gray200};
      `}

  input {
    display: none;

    padding: 0;
  }
`;

export const chipSize = ({ size }: { size: Size }) => css`
  ${size === 'fluid' &&
  css`
    padding: 8px 18px;
  `};

  ${size === 'fixed' &&
  css`
    align-items: center;
    justify-content: center;

    width: 67px;
    height: 38px;
  `};

  ${size === 'full' &&
  css`
    flex: 1;
    align-items: center;
    justify-content: center;

    padding: 10px 0;
  `};
`;
