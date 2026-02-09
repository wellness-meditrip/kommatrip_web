import { useMemo } from 'react';
import type { NextPageContext } from 'next';
import NotFoundPage from './404';
import ServerErrorPage from './500';

interface ErrorProps {
  statusCode?: number;
}

export default function ErrorPage({ statusCode }: ErrorProps) {
  const isNotFound = useMemo(() => statusCode === 404, [statusCode]);
  return isNotFound ? <NotFoundPage /> : <ServerErrorPage />;
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};
