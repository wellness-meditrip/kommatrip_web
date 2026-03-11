import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { getI18nServerSideProps } from '@/i18n/page-props';

// 패키지 리스트 페이지
export default function PackageListPage() {
  const tCommon = useTranslations('common');
  const t = useTranslations('packages');
  const pageTitle = `${tCommon('app.name')} | ${t('title')}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <>패키지 리스트 페이지입니다</>
    </>
  );
}

export const getServerSideProps = getI18nServerSideProps(['packages']);
