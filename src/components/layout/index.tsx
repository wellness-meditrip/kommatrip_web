/** @jsxImportSource @emotion/react */
import { CSSProperties, ReactNode } from 'react';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { screen, main } from './index.styles';
import { Footer } from '../footer';

interface Props {
  isAppBarExist?: boolean;
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

export function Layout({ isAppBarExist = true, title, children, style, showFooter = true }: Props) {
  const t = useTranslations('common');
  const appName = t('app.name');
  const appTitle = t('app.title');
  const fullTitle = title ? `${title} | ${appName}` : `${appName} | ${appTitle}`;

  return (
    <div css={screen}>
      <Head>
        <title>{fullTitle}</title>
      </Head>
      <main css={main({ isAppBarExist })} style={style}>
        {children}
        {showFooter && <Footer />}
      </main>
    </div>
  );
}
