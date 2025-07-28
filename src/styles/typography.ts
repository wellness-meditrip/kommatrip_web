import { css } from '@emotion/react';

const typography = {
  title_L: css`
    font-size: 20px;
    font-weight: 600;
  `,

  title_M: css`
    font-size: 18px;
    font-weight: 600;
  `,
  title_S: css`
    font-size: 16px;
    font-weight: 600;
  `,

  body_M: css`
    font-size: 14px;
    font-weight: 600;
  `,
  body_S: css`
    font-size: 12px;
    font-weight: 600;
  `,

  button_L: css`
    font-size: 16px;
    font-weight: 500;
  `,
  button_M: css`
    font-size: 14px;
    font-weight: 500;
  `,
  button_S: css`
    font-size: 12px;
    font-weight: 500;
  `,
} as const;

export default typography;
