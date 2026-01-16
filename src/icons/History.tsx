import * as React from 'react';
import type { SVGProps } from 'react';
export const History = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <g
      stroke="#65635E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#history_svg__a)"
    >
      <path d="M8 1.332a6.667 6.667 0 0 1 4.92 11.167M8 4v4l2.667 1.333M1.666 5.918a6.7 6.7 0 0 0-.333 2M1.887 10.668a6.7 6.7 0 0 0 1.62 2.267M3.09 3.49q.28-.305.595-.572M5.763 14.28a6.67 6.67 0 0 0 5.087-.253" />
    </g>
    <defs>
      <clipPath id="history_svg__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
