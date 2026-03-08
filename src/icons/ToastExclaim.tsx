import * as React from 'react';
import type { SVGProps } from 'react';
export const ToastExclaim = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
    <circle cx={8} cy={8} r={8} fill="#5D86FE" />
    <circle cx={8} cy={12} r={0.5} fill="#fff" />
    <path stroke="#fff" strokeLinecap="round" d="M8 4v5.5" />
  </svg>
);
