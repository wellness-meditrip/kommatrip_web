import * as React from 'react';
import type { SVGProps } from 'react';
export const ClinicClock = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <g
      stroke="#271F1D"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      clipPath="url(#clinic_clock_svg__a)"
    >
      <path d="M8 4v4l2.667 1.333" />
      <path d="M8 14.667A6.667 6.667 0 1 0 8 1.334a6.667 6.667 0 0 0 0 13.333" />
    </g>
    <defs>
      <clipPath id="clinic_clock_svg__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
