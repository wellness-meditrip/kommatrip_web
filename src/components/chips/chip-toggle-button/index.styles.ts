import { theme } from '@/styles';
import { css } from '@emotion/react';
import { Size, Service } from './index.types';

export const wrapper = ({
  isSelected,
  size,
  disabled,
  isPartnerSelected,
  isTagSelected,
  service,
}: {
  isSelected: boolean;
  size: Size;
  disabled: boolean;
  isPartnerSelected: boolean | null;
  isTagSelected: boolean;
  service: Service;
}) => {
  const borderColor =
    service === 'partner'
      ? theme.colors.green200
      : service === 'user'
        ? theme.colors.primary30
        : theme.colors.gray200;
  const backgroundColor =
    service === 'partner'
      ? theme.colors.green200
      : service === 'user'
        ? theme.colors.primary30
        : theme.colors.white;
  const textColor =
    service === 'partner'
      ? theme.colors.white
      : service === 'user'
        ? theme.colors.white
        : theme.colors.gray600;

  return css`
    ${size === 'fixed' &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;

      width: 67px;
      height: 38px;
      border-radius: 19px;
      ${theme.typo.body11};
    `}

    ${size === 'fluid' &&
    css`
      padding: 8px 18px;
      border-radius: 30px;
      ${theme.typo.body9};
    `}

    ${size === 'full' &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;

      width: 100%;
      padding: 10px 0;
      border-radius: 28px;
      ${theme.typo.body10};
    `}

    ${size === 'circle' &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;

      width: 34px;
      height: 34px;
      border-radius: 50%;

      text-align: center;
      ${theme.typo.body6};
    `}

    ${disabled
      ? css`
          background: ${theme.colors.gray200} !important;
          color: ${theme.colors.gray400} !important;

          cursor: default !important;
        `
      : css`
          transition: all 0.25s ease;
        `}

    ${isSelected
      ? css`
          border: 1px solid ${disabled ? theme.colors.gray300 : borderColor};

          background: ${backgroundColor};
          color: ${textColor};
        `
      : css`
          border: 1px solid ${disabled ? theme.colors.gray300 : theme.colors.gray200};

          background: ${theme.colors.white};
          color: ${theme.colors.gray500};
        `}
    
    ${isPartnerSelected &&
    css`
      border: none;

      background: ${theme.colors.green200};
      color: ${theme.colors.white};
    `}

    ${isTagSelected &&
    css`
      border: none;

      background: ${theme.colors.black};
      color: ${theme.colors.white};
    `}
  `;
};
