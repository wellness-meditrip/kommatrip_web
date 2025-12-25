import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Layout,
  AppBar,
  SearchBar,
  Text,
  CompanyCard,
  GNB,
  CompanyList,
  DesktopAppBar,
  Loading,
} from '@/components';
import { useMediaQuery } from '@/hooks';
import { useGetRecommendedCompanyQuery, useGetRecentCompanyQuery } from '@/queries/company';

import { theme } from '@/styles';
import { css } from '@emotion/react';
import { ROUTES } from '@/constants';

// 홈 페이지 (루트 경로)
export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('common');
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);

  // 최근 본 업체 조회
  const { data: recentCompanies, isLoading: isRecentLoading } = useGetRecentCompanyQuery(true);

  const { data: recommendedCompanies, isLoading: isRecommendedLoading } =
    useGetRecommendedCompanyQuery();

  // API 응답을 CompanyList 형식으로 변환
  const formattedRecentCompanies = useMemo(() => {
    if (!recentCompanies || recentCompanies.length === 0) return [];

    return recentCompanies.map((company) => ({
      hospital_id: company.id,
      hospital_name: company.name,
      address: company.simple_place,
      rating: 4.5, // API에 rating이 없으면 기본값 사용
      image_url: company.photos?.[0] || '/default.png',
      images: company.photos || [],
      departments: company.tags || [],
      is_exclusive: company.is_exclusive,
    }));
  }, [recentCompanies]);

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

  const handleCompanyClick = (companyId: number) => {
    router.push(`${ROUTES.COMPANY}/${companyId}`);
  };

  return (
    <Layout isAppBarExist={false}>
      {isDesktop ? (
        <DesktopAppBar onSearchChange={handleValueChange} onSearch={handleSearch} />
      ) : (
        <div css={headerSection}>
          <AppBar onBackClick={router.back} logo="light" />
          <div css={heroContent}>
            <Text typo="title_L" color="white" css={heroTitle}>
              {t('home.heroTitle')}
            </Text>
          </div>
          <div css={searchBarWrapper}>
            <SearchBar
              onValueChange={handleValueChange}
              onSearch={handleSearch}
              placeholder={t('home.searchPlaceholder')}
            />
          </div>
        </div>
      )}

      <div css={wrapper}>
        {/* 최근 본 업체 섹션 */}
        {isRecentLoading ? (
          <Loading title={t('home.loadingRecent')} />
        ) : formattedRecentCompanies.length > 0 ? (
          <CompanyList title={t('home.recentlyViewed')} companies={formattedRecentCompanies} />
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
  );
}

// 통합 헤더 영역
export const headerSection = css`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;

  background: linear-gradient(135deg, #2d3e36 0%, #476155 50%, #749a88 100%);

  > * {
    position: relative;
    z-index: 2;
  }
`;

export const heroContent = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: center;

  margin: 34px 0 20px 0;
  gap: 16px;
`;

export const heroTitle = css`
  color: ${theme.colors.white};
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const title = css`
  align-self: flex-start;
  margin-bottom: 20px;
`;

export const searchBarWrapper = css`
  width: 100%;
  margin: 0 auto;
  flex-shrink: 0;
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
