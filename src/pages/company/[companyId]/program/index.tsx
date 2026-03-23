import type { GetServerSideProps } from 'next';
import { defaultLocale, locales, type Locale } from '@/i18n/routing';

const resolveLocale = (localeHeader: string | string[] | undefined): Locale => {
  const candidate = Array.isArray(localeHeader) ? localeHeader[0] : localeHeader;

  if (candidate && locales.includes(candidate as Locale)) {
    return candidate as Locale;
  }

  return defaultLocale;
};

export default function LegacyCompanyProgramPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const locale = resolveLocale(req.headers['x-locale']);
  const rawCompanyId = params?.companyId;
  const companyId = Array.isArray(rawCompanyId) ? rawCompanyId[0] : rawCompanyId;

  return {
    redirect: {
      destination: companyId ? `/${locale}/company/${companyId}` : `/${locale}/company`,
      permanent: true,
    },
  };
};
