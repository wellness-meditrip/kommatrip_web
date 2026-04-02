import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import type { GetStaticProps } from 'next';
import {
  Layout,
  HeroSection,
  Text,
  CompanyCard,
  GNB,
  CompanyList,
  CompanyCardSkeletonList,
} from '@/components';
import { Meta, buildHomeJsonLd, createPageMeta } from '@/seo';
import { useMediaQuery, useAuthState } from '@/hooks';
import { useGetRecommendedCompanyQuery, useGetRecentCompanyQuery } from '@/queries/company';
import { useAuthStore } from '@/store/auth';
import { QUERY_KEYS } from '@/queries/query-keys';

import { theme } from '@/styles';
import { css } from '@emotion/react';
import { ROUTES } from '@/constants';
import { withI18nGsp } from '@/i18n/page-props';
import { useCurrentLocale } from '@/i18n/navigation';

interface HomePageProps {
  heroImages: string[];
}

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const MAX_RECENT_SKELETON_COUNT = 6;
const HOME_REVALIDATE_SECONDS = 300;
const PRIORITY_RECOMMENDED_COMPANY_ID = 17; // TODO: 이벤트 기간 동안 우선순위로 노출, 기간 후 제거 예정

const normalizeSkeletonCount = (count: number) => {
  if (count <= 0) return 0;
  return Math.min(MAX_RECENT_SKELETON_COUNT, Math.max(1, count));
};

const getRecentCount = (value: unknown) => {
  if (!Array.isArray(value)) return null;
  return value.length;
};

// 추천 업체 우선순위 결정
const prioritizeRecommendedCompanies = <T extends { id: number }>(companies: T[]) => {
  if (companies.length === 0) return companies;

  const prioritized: T[] = [];
  const remaining: T[] = [];

  companies.forEach((company) => {
    if (company.id === PRIORITY_RECOMMENDED_COMPANY_ID) {
      prioritized.push(company);
      return;
    }

    remaining.push(company);
  });

  return prioritized.length > 0 ? [...prioritized, ...remaining] : companies;
};

// 홈 페이지 (루트 경로)
export default function HomePage({ heroImages }: HomePageProps) {
  const router = useRouter();
  const t = useTranslations('common');
  const currentLocale = useCurrentLocale();
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { isAuthenticated } = useAuthState();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = isAuthenticated;
  const queryClient = useQueryClient();
  const [recentSkeletonCount, setRecentSkeletonCount] = useState<number>(() => {
    const cachedCount = getRecentCount(queryClient.getQueryData(QUERY_KEYS.GET_RECENT_COMPANY));
    return normalizeSkeletonCount(cachedCount ?? 0);
  });
  const appName = t('app.name');
  const appTitle = t('app.title');
  const appDescription = t('app.description');
  const pageTitle = `${appName} | ${appTitle}`;
  const ogImagePath = '/og/OG_image.jpg';
  const homePath = router.asPath || `/${currentLocale}`;
  const jsonLd = buildHomeJsonLd({
    locale: currentLocale,
    path: homePath,
    siteName: appName,
    description: appDescription,
    image: ogImagePath,
  });
  const meta = createPageMeta({
    pageTitle,
    description: appDescription,
    path: homePath,
    image: ogImagePath,
    jsonLd,
  });

  // 최근 본 업체 조회
  const {
    data: recentCompanies,
    isLoading: isRecentLoading,
    refetch: refetchRecentCompanies,
  } = useGetRecentCompanyQuery(isLoggedIn);

  const { data: recommendedCompanies, isLoading: isRecommendedLoading } =
    useGetRecommendedCompanyQuery();

  useEffect(() => {
    if (!isLoggedIn || !accessToken) return;
    refetchRecentCompanies();
  }, [isLoggedIn, accessToken, refetchRecentCompanies]);

  useEffect(() => {
    if (isLoggedIn) return;
    queryClient.removeQueries({ queryKey: QUERY_KEYS.GET_RECENT_COMPANY });
  }, [isLoggedIn, queryClient]);

  useEffect(() => {
    if (!isLoggedIn) {
      setRecentSkeletonCount(0);
      return;
    }

    if (Array.isArray(recentCompanies)) {
      const nextCount = normalizeSkeletonCount(recentCompanies.length);
      setRecentSkeletonCount((prev) => (prev === nextCount ? prev : nextCount));
      return;
    }

    const cachedCount = getRecentCount(queryClient.getQueryData(QUERY_KEYS.GET_RECENT_COMPANY));
    if (cachedCount === null) return;

    const nextCount = normalizeSkeletonCount(cachedCount);
    setRecentSkeletonCount((prev) => (prev === nextCount ? prev : nextCount));
  }, [isLoggedIn, recentCompanies, queryClient]);

  // API 응답을 CompanyList 형식으로 변환
  const formattedRecentCompanies = useMemo(() => {
    if (!isLoggedIn) return [];
    if (!recentCompanies || recentCompanies.length === 0) return [];

    return recentCompanies.map((company) => ({
      hospital_id: company.id,
      hospital_name: company.name,
      address: company.simple_place ?? (company as { simpleplace?: string }).simpleplace ?? '',
      rating: 4.5, // API에 rating이 없으면 기본값 사용
      image_url: company.photos?.[0] || '/default.png',
      images: company.photos || [],
      departments: company.tags || [],
      is_exclusive: company.is_exclusive,
    }));
  }, [recentCompanies, isLoggedIn]);

  // 추천 업체 데이터 변환
  const formattedRecommendedCompanies = useMemo(() => {
    if (!recommendedCompanies || recommendedCompanies.length === 0) return [];

    return prioritizeRecommendedCompanies(recommendedCompanies).map((company) => ({
      id: company.id,
      name: company.name,
      address: company.simpleplace ?? company.simple_place ?? '',
      image: company.photos?.[0] || '/default.png',
      images: company.photos || [], // 이미지 캐러셀용 전체 이미지 배열
      tags: company.tags || [],
      is_exclusive: company.is_exclusive,
    }));
  }, [recommendedCompanies]);

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };

  const handleSearch = () => {
    const query = inputValue.trim() ? `?q=${encodeURIComponent(inputValue)}` : '';
    router.push(`${ROUTES.SEARCH}${query}`);
  };

  const handleGoToSearch = () => {
    handleSearch();
  };

  const handleCompanyClick = (companyId: number) => {
    router.push(`${ROUTES.COMPANY}/${companyId}`);
  };

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false}>
        <HeroSection
          images={heroImages}
          title={t('home.heroTitle')}
          placeholder={t('home.searchPlaceholder')}
          subtitle={t('home.heroSubtitle')}
          onSearchChange={handleValueChange}
          onSearch={handleSearch}
          onSearchBarClick={handleGoToSearch}
          onBackClick={router.back}
          isDesktop={isDesktop}
        />

        <div css={wrapper}>
          {/* 최근 본 업체 섹션 */}
          {isRecentLoading && recentSkeletonCount > 0 ? (
            <CompanyCardSkeletonList
              title={t('home.recentlyViewed')}
              size="compact"
              layout="horizontal"
              count={recentSkeletonCount}
            />
          ) : formattedRecentCompanies.length > 0 ? (
            <CompanyList
              title={t('home.recentlyViewed')}
              companies={formattedRecentCompanies}
              cardSize="compact"
            />
          ) : null}

          <Text typo="title_M" color="text_primary" css={title}>
            {t('home.recommendedTitle')}
          </Text>

          {isRecommendedLoading ? (
            <CompanyCardSkeletonList size="default" layout="grid" count={isDesktop ? 6 : 3} />
          ) : formattedRecommendedCompanies.length > 0 ? (
            <div css={cardsGrid}>
              {formattedRecommendedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  companyId={company.id}
                  companyImage={company.image}
                  companyName={company.name}
                  companyAddress={company.address}
                  badges={company.tags}
                  images={company.images}
                  isExclusive={company.is_exclusive}
                  fixedHeight={true}
                  carouselDotsMode="hidden"
                  onClick={() => handleCompanyClick(company.id)}
                />
              ))}
            </div>
          ) : (
            <Text typo="body_M" color="text_secondary">
              {t('home.noRecommendedCompanies')}
            </Text>
          )}
        </div>
        <GNB />
      </Layout>
    </>
  );
}

export const title = css`
  align-self: flex-start;
  margin-bottom: 20px;
`;

export const cardsGrid = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  justify-items: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  /* overflow-y: auto; */

  width: 100%;
  /* height: 100%; */

  padding: 26px;

  background-color: ${theme.colors.bg_default};
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;

export const getStaticProps: GetStaticProps<HomePageProps> =
  withI18nGsp<HomePageProps>(async () => {
    const path = await import('node:path');
    const { readdir } = await import('node:fs/promises');

    const dir = path.join(process.cwd(), 'public', 'images', 'hero');
    let heroImages: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });
      heroImages = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => ALLOWED_EXTS.has(path.extname(name).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
        .map((name) => `/images/hero/${name}`);
    } catch {
      heroImages = [];
    }

    return {
      props: {
        heroImages,
      },
      revalidate: HOME_REVALIDATE_SECONDS,
    };
  }, ['common']);
