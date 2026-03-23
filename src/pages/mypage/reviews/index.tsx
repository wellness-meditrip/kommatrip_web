import { useRouter } from 'next/router';
import { AppBar } from '@/components';
import { Layout } from '@/components/layout';
import { useTranslations } from 'next-intl';
import { MyReviewsPanel } from '@/components/mypage/reviews-panel';
import { Meta, createPageMeta } from '@/seo';
import { getI18nServerSideProps } from '@/i18n/page-props';

// 내가 작성한 리뷰 조회
export default function MyReviewsPage() {
  const router = useRouter();
  const tMypage = useTranslations('mypage');
  const tCommon = useTranslations('common');
  const meta = createPageMeta({
    pageTitle: tMypage('reviews.myReviews'),
    description: tCommon('app.description'),
    path: router.asPath || '/mypage/reviews',
    noindex: true,
  });

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={tMypage('reviews.myReviews')}>
        <AppBar
          onBackClick={router.back}
          leftButton
          buttonType="dark"
          title={tMypage('reviews.myReviews')}
        />
        <MyReviewsPanel />
      </Layout>
    </>
  );
}

export const getServerSideProps = getI18nServerSideProps(['mypage', 'review', 'review-list']);
