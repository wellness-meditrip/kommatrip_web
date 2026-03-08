import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Service } from '../../../types';
import { Size, Variant } from './index.types';

interface WrapperProps {
  size: Size;
  service: Service;
  variant: Variant;
  disabled: boolean;
  fullWidth: boolean;
}

export const wrapper = ({ size, service, variant, disabled, fullWidth }: WrapperProps) => css`
  ${box};
  ${buttonSize({ size, fullWidth })};
  ${buttonVariant({ service, variant, disabled })};
`;

export const box = css`
  display: flex;
  align-items: center;
  justify-content: center;

  transition: background 0.5s ease;
`;

export const buttonSize = ({ size, fullWidth }: { size: Size; fullWidth: boolean }) => css`
  ${size === 'XL' &&
  css`
    width: 100%;
    height: 70px;
    padding: 27px 0;
    border-radius: 35px;
    ${theme.typo.title2};
  `}
  ${size === 'L' &&
  css`
    width: ${fullWidth ? '100%' : '354px'};
    padding: 18px 0;
    border-radius: 27px;
    ${theme.typo.subtitle2};
  `}
  ${size === 'M' &&
  css`
    width: ${fullWidth ? '100%' : '172px'};
    padding: 16px 0;
    border-radius: 24px;
    ${theme.typo.body1};
  `}
  ${size === 'S' &&
  css`
    width: ${fullWidth ? '100%' : '143px'};
    padding: 13px 0;
    border-radius: 30px;
    ${theme.typo.body1};
  `}
  ${size === 'XS' &&
  css`
    width: ${fullWidth ? '100%' : '60px'};
    padding: 10px 0;
    border-radius: 30px;
    ${theme.typo.body4};
  `}
`;

export const buttonVariant = ({
  service,
  variant,
  disabled,
}: {
  service: Service;
  variant: Variant;
  disabled: boolean;
}) => css`
  ${!disabled &&
  css`
    &:hover {
      opacity: 0.8;
    }
    transition: opacity 0.25s ease;
  `}

  ${disabled &&
  css`
    background: ${theme.colors.gray400} !important;
    color: ${theme.colors.white} !important;

    cursor: default;
  `}

  ${variant === 'primary' &&
  css`
    background: ${service === 'daengle' ? theme.colors.primary50 : theme.colors.greenGradient100};
    color: ${theme.colors.white};
  `}
  ${variant === 'primaryLow' &&
  css`
    background-color: ${theme.colors.blue100};
    color: ${theme.colors.blue200};
  `}
  ${variant === 'ghost' &&
  css`
    border: 1px solid ${theme.colors.gray200};

    color: ${theme.colors.gray200};
  `}
  ${variant === 'kakao' &&
  css`
    background: #fee500;
    color: ${theme.colors.black};
  `}
`;
