import * as React from 'react';
import type { SVGProps } from 'react';
export const ToastCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <circle cx={8} cy={8} r={8} fill="#FF8E66" />
    <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M5 7.5 7.308 10 11 6" />
  </svg>
);
