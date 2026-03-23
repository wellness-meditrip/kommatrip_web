import type { GetServerSideProps } from 'next';
import { defaultLocale, locales, type Locale } from '@/i18n/routing';

const resolveLocale = (localeHeader: string | string[] | undefined): Locale => {
  const candidate = Array.isArray(localeHeader) ? localeHeader[0] : localeHeader;

  if (candidate && locales.includes(candidate as Locale)) {
    return candidate as Locale;
  }

  return defaultLocale;
};

export default function PackagesRedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const locale = resolveLocale(req.headers['x-locale']);

  return {
    redirect: {
      destination: `/${locale}/company`,
      permanent: true,
    },
  };
};
