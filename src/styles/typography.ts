import { css } from '@emotion/react';
import { title } from 'process';

const typography = {
  title_XL: css`
    font-size: 32px;
    font-weight: 600;
  `,
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
    font-weight: 500;
  `,
  title_XS: css`
    font-size: 14px;
    font-weight: 500;
  `,

  body_XL: css`
    font-size: 32px;
    font-weight: 500;
  `,
  body_L: css`
    font-size: 18px;
    font-weight: 400;
  `,

  body_M: css`
    font-size: 14px;
    font-weight: 400;
  `,
  body_S: css`
    font-size: 12px;
    font-weight: 400;
  `,

  body_XS: css`
    font-size: 10px;
    font-weight: 400;
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
  button_XS: css`
    font-size: 12px;
    font-weight: 400;
  `,

  //test
  title1: css`
    font-size: 24px;
    font-weight: 600;
  `,
  title2: css`
    font-size: 20px;
    font-weight: 600;
  `,

  subtitle1: css`
    font-size: 16px;
    font-weight: 600;
  `,
  subtitle2: css`
    font-size: 15px;
    font-weight: 600;
  `,
  subtitle3: css`
    font-size: 16px;
    font-weight: 500;
  `,

  body1: css`
    font-size: 14px;
    font-weight: 600;
  `,
  body2: css`
    font-size: 9px;
    font-weight: 600;
  `,
  body3: css`
    font-size: 18px;
    font-weight: 500;
  `,
  body4: css`
    font-size: 14px;
    font-weight: 500;
  `,
  body5: css`
    font-size: 12px;
    font-weight: 500;
  `,
  body6: css`
    font-size: 11px;
    font-weight: 500;
  `,
  body7: css`
    font-size: 10px;
    font-weight: 500;
  `,
  body8: css`
    font-size: 16px;
    font-weight: 400;
  `,
  body9: css`
    font-size: 14px;
    font-weight: 400;
  `,
  body10: css`
    font-size: 13px;
    font-weight: 400;
  `,
  body11: css`
    font-size: 12px;
    font-weight: 400;
  `,
  body12: css`
    font-size: 10px;
    font-weight: 400;
  `,
} as const;

export default typography;
