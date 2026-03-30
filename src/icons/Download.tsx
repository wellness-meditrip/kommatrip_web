import * as React from 'react';
import type { SVGProps } from 'react';

export const Download = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M10 3.75v8.5m0 0 3-3m-3 3-3-3M4.75 14.75h10.5"
    />
  </svg>
);
