import type { GetServerSideProps } from 'next';
import { detectRequestLocale } from '@/i18n/locale';

export default function LegacyCompanyProgramPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const locale = detectRequestLocale({
    localeHeader: req.headers['x-locale'],
    pathname: req.url,
    cookieHeader: req.headers.cookie,
  });
  const rawCompanyId = params?.companyId;
  const companyId = Array.isArray(rawCompanyId) ? rawCompanyId[0] : rawCompanyId;

  return {
    redirect: {
      destination: companyId ? `/${locale}/company/${companyId}` : `/${locale}/company`,
      permanent: true,
    },
  };
};
