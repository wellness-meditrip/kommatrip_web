import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import type { GetStaticProps } from 'next';
import { Layout, HeroSection, Text, CompanyCard, GNB, CompanyList, Loading } from '@/components';
import { Meta, createPageMeta } from '@/seo';
import { useMediaQuery } from '@/hooks';
import { useGetRecommendedCompanyQuery, useGetRecentCompanyQuery } from '@/queries/company';
import { useAuthStore } from '@/store/auth';
import { QUERY_KEYS } from '@/queries/query-keys';

import { theme } from '@/styles';
import { css } from '@emotion/react';
import { ROUTES } from '@/constants';

interface HomePageProps {
  heroImages: string[];
}

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

// 홈 페이지 (루트 경로)
export default function HomePage({ heroImages }: HomePageProps) {
  const router = useRouter();
  const t = useTranslations('common');
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { status } = useSession();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = status === 'authenticated' || !!accessToken;
  const queryClient = useQueryClient();
  const appName = t('app.name');
  const appTitle = t('app.title');
  const appDescription = t('app.description');
  const pageTitle = `${appName} | ${appTitle}`;
  const ogImagePath = '/og/OG_image.jpg';
  const meta = createPageMeta({
    pageTitle,
    description: appDescription,
    path: router.asPath || '/',
    image: ogImagePath,
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

    return recommendedCompanies.map((company) => ({
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
          {isRecentLoading ? (
            <Loading title={t('home.loadingRecent')} />
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
            <Loading title={t('home.loadingRecommended')} />
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

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
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
  };
};
