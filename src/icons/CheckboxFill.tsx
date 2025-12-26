import * as React from 'react';
import type { SVGProps } from 'react';
export const CheckboxFill = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <g strokeLinecap="round" strokeLinejoin="round" clipPath="url(#checkbox_fill_svg__a)">
      <path
        fill="#749A88"
        stroke="#749A88"
        d="M8 14.667A6.667 6.667 0 1 0 8 1.334a6.667 6.667 0 0 0 0 13.333"
      />
      <path stroke="#FAFAFA" d="m6 8 1.333 1.333L10 6.666" />
    </g>
    <defs>
      <clipPath id="checkbox_fill_svg__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
