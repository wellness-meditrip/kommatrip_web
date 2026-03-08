import * as React from 'react';
import type { SVGProps } from 'react';
export const GoogleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" {...props}>
    <mask
      id="google_logo_svg__a"
      width={25}
      height={25}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'luminance',
      }}
    >
      <path fill="#fff" d="M25 0H0v25h25z" />
    </mask>
    <g mask="url(#google_logo_svg__a)">
      <path
        fill="#4285F4"
        d="M24.5 12.783c0-.886-.08-1.738-.227-2.556H12.5v4.835h6.727a5.75 5.75 0 0 1-2.494 3.773v3.136h4.04c2.363-2.176 3.727-5.38 3.727-9.188"
      />
      <path
        fill="#34A853"
        d="M12.499 24.998c3.375 0 6.204-1.12 8.272-3.028l-4.04-3.137c-1.119.75-2.55 1.193-4.232 1.193-3.256 0-6.012-2.198-6.995-5.153H1.328v3.239a12.5 12.5 0 0 0 11.17 6.886"
      />
      <path
        fill="#FBBC04"
        d="M5.506 14.875a7.5 7.5 0 0 1-.392-2.375c0-.823.142-1.625.392-2.375V6.887H1.329A12.5 12.5 0 0 0 0 12.5c0 2.017.483 3.927 1.33 5.614z"
      />
      <path
        fill="#E94235"
        d="M12.499 4.972c1.835 0 3.483.63 4.778 1.869l3.585-3.585C18.698 1.239 15.868 0 12.5 0a12.5 12.5 0 0 0-11.17 6.886l4.175 3.239C6.487 7.17 9.243 4.972 12.5 4.972"
      />
    </g>
  </svg>
);
