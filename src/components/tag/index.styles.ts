import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Service, Variant } from './index.types';

export const wrapper = ({ variant, service }: { variant: Variant; service: Service }) => css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: fit-content;
  height: fit-content;
  padding: 4px 8px;
  border-radius: 4px;

  ${variant === 'solid' && solid({ service })};
  ${variant === 'line' && line({ service })};
  ${variant === 'ghost' && ghost};
`;

export const solid = ({ service }: { service: Service }) => css`
  background: ${service === 'meditrip' ? theme.colors.primary30 : theme.colors.gray100};
`;

export const line = ({ service }: { service: Service }) => css`
  background: ${service === 'search'
    ? theme.colors.white
    : service === 'meditrip'
      ? theme.colors.primary10Opacity40
      : theme.colors.gray100};
  color: ${service === 'search'
    ? theme.colors.text_primary
    : theme.colors.text_tertiary} !important;
`;

export const ghost = css`
  background: ${theme.colors.gray200};
`;
