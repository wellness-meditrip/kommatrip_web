import * as React from 'react';
import type { SVGProps } from 'react';
export const ClinicGlobe = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <g
      stroke="#271F1D"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      clipPath="url(#clinic_globe_svg__a)"
    >
      <path d="M14.36 10h-3.027A1.334 1.334 0 0 0 10 11.333v3.027M4.667 2.227v1.106a2 2 0 0 0 2 2A1.333 1.333 0 0 1 8 6.667a1.333 1.333 0 0 0 2.667 0c0-.734.6-1.334 1.333-1.334h2.113M7.333 14.634V12A1.333 1.333 0 0 0 6 10.667a1.333 1.333 0 0 1-1.333-1.333v-.667a1.333 1.333 0 0 0-1.334-1.333H1.367" />
      <path d="M8 14.667A6.667 6.667 0 1 0 8 1.334a6.667 6.667 0 0 0 0 13.333" />
    </g>
    <defs>
      <clipPath id="clinic_globe_svg__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
