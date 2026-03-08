import { css } from '@emotion/react';

export const wrapper = ({ size }: { size: 'S' | 'L' }) => css`
  display: flex;
  gap: ${size === 'S' ? '2px' : '6px'};
`;
