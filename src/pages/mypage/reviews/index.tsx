import { useRouter } from 'next/router';
import { AppBar } from '@/components';
import { Layout } from '@/components/layout';
import { useTranslations } from 'next-intl';
import { MyReviewsPanel } from '@/components/mypage/reviews-panel';

// 내가 작성한 리뷰 조회
export default function MyPage() {
  const router = useRouter();
  const tMypage = useTranslations('mypage');

  return (
    <Layout isAppBarExist={false} title={tMypage('reviews.myReviews')}>
      <AppBar
        onBackClick={router.back}
        leftButton
        buttonType="dark"
        title={tMypage('reviews.myReviews')}
      />
      <MyReviewsPanel />
    </Layout>
  );
}
