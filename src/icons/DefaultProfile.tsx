import * as React from 'react';
import type { SVGProps } from 'react';
export const DefaultProfile = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 50" {...props}>
    <circle cx={25} cy={25} r={25} fill="#BCDACC" />
    <path
      stroke="#65635E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M25 26a5 5 0 1 0 0-10 5 5 0 0 0 0 10"
    />
    <path
      stroke="#65635E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M33 34a8 8 0 0 0-16 0"
    />
  </svg>
);
