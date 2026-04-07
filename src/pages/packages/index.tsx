import type { GetServerSideProps } from 'next';
import { detectRequestLocale } from '@/i18n/locale';

export default function PackagesRedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const locale = detectRequestLocale({
    localeHeader: req.headers['x-locale'],
    pathname: req.url,
    cookieHeader: req.headers.cookie,
  });

  return {
    redirect: {
      destination: `/${locale}/company`,
      permanent: true,
    },
  };
};
