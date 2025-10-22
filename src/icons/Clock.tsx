import * as React from 'react';
import type { SVGProps } from 'react';
export const Clock = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 16" {...props}>
    <path stroke="#476155" strokeLinecap="round" strokeLinejoin="round" d="M8.25 4v4l2.667 1.333" />
    <path
      stroke="#476155"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 14.667a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333"
    />
  </svg>
);
