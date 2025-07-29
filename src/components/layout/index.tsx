/** @jsxImportSource @emotion/react */
import { CSSProperties, ReactNode } from 'react';
import { screen, main } from './index.styles';

interface Props {
  isAppBarExist?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Layout({ isAppBarExist = true, children, style }: Props) {
  return (
    <div css={screen}>
      <main css={main({ isAppBarExist })} style={style}>
        {children}
      </main>
    </div>
  );
}
