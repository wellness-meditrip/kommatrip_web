import * as React from 'react';
import type { SVGProps } from 'react';
export const Copy = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <rect
      x="5"
      y="5"
      width="9"
      height="9"
      rx="2"
      stroke="#231A00"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      stroke="#231A00"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 11V4a2 2 0 0 1 2-2h7"
    />
  </svg>
);
