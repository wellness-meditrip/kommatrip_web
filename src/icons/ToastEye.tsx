import { SVGProps } from 'react';

export const ToastEye = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" {...props}>
    <path
      d="M1.667 10C3.111 6.556 6.056 4.583 10 4.583s6.889 1.973 8.333 5.417c-1.444 3.444-4.389 5.417-8.333 5.417S3.111 13.444 1.667 10Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
