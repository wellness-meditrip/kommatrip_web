import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';
import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import {
  SearchBar,
  CompanyCard,
  CompanyList,
  Empty,
  NoResults,
  FilterBar,
  GNB,
  DesktopAppBar,
  PageErrorEmpty,
  CompanyCardSkeletonList,
} from '@/components';
import { Meta, createPageMeta } from '@/seo';
import type { GetServerSideProps } from 'next';
import { useGetCompanySearchQuery } from '@/queries/company';
import { ROUTES } from '@/constants/commons/routes';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { filterCompanies, normalizeSearchTerm } from '@/utils/search';
import type { Company } from '@/models';
import { useTranslations } from 'next-intl';
import { useCurrentLocale } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks';
import { GnbCalendarActive, GnbSearchActive } from '@/icons';
import { CATEGORIES } from '@/constants/commons/categories';
import { withI18nGssp } from '@/i18n/page-props';

interface CompanyPageProps {
  initialKeyword: string;
  initialCanonicalPath: string;
}

const DEFAULT_MOBILE_SKELETON_COUNT = 4;
const DEFAULT_DESKTOP_SKELETON_COUNT = 6;
const MAX_LIST_SKELETON_COUNT = 20;
const DEFAULT_RECOMMENDED_SKELETON_COUNT = 4;

const normalizeSkeletonCount = (count: number, fallback: number) => {
  if (count <= 0) return 0;
  return Math.min(MAX_LIST_SKELETON_COUNT, Math.max(1, count || fallback));
};

// 업체 리스트 페이지
export default function CompanyPage({ initialKeyword, initialCanonicalPath }: CompanyPageProps) {
  const router = useRouter();
  const t = useTranslations('company');
  const tCommon = useTranslations('common');
  const currentLocale = useCurrentLocale();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { q, categories, date, endDate } = router.query;
  const appDescription = tCommon('app.description');
  const rawKeyword = typeof q === 'string' ? q : initialKeyword;
  const metaKeyword = rawKeyword.trim();
  const metaDescription = metaKeyword ? `${metaKeyword} - ${t('list.title')}` : appDescription;
  const ogImage = '/og/OG_image.jpg';
  const meta = createPageMeta({
    keyword: metaKeyword || undefined,
    pageTitle: t('title'),
    description: metaDescription,
    path: router.asPath || initialCanonicalPath,
    image: ogImage,
  });
  const [inputValue, setInputValue] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [lastResolvedResultCount, setLastResolvedResultCount] = useState<number | null>(null);

  // URL 쿼리 파라미터에서 필터 정보 읽어오기
  useEffect(() => {
    if (q && typeof q === 'string') {
      setInputValue(q);
      setKeyword(q);
    }

    if (categories && typeof categories === 'string') {
      setSelectedCategories(categories.split(',').filter(Boolean));
    }

    const nextRange = { start: null, end: null } as {
      start: Date | null;
      end: Date | null;
    };

    if (date && typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        nextRange.start = parsedDate;
      }
    }

    if (endDate && typeof endDate === 'string') {
      const parsedEndDate = new Date(endDate);
      if (!isNaN(parsedEndDate.getTime())) {
        nextRange.end = parsedEndDate;
      }
    }

    setSelectedRange(nextRange);
  }, [q, categories, date, endDate]);

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${month}.${day}(${weekday})`;
  };

  const dateText = selectedRange.start
    ? selectedRange.end
      ? `${formatDateDisplay(selectedRange.start)} - ${formatDateDisplay(selectedRange.end)}`
      : `${formatDateDisplay(selectedRange.start)}`
    : t('searchDate');

  const searchParams = useMemo(
    () => ({
      search_term: keyword || '',
      tags: selectedCategories.length > 0 ? selectedCategories : null,
      location: null,
      skip: 0,
      limit: 20,
      date: selectedRange.start ? formatDateParam(selectedRange.start) : undefined,
      endDate: selectedRange.end ? formatDateParam(selectedRange.end) : undefined,
    }),
    [keyword, selectedCategories, selectedRange]
  );

  const recommendedSearchParams = useMemo(
    () => ({
      search_term: '',
      tags: null,
      location: null,
      skip: 0,
      limit: 4,
      date: undefined,
    }),
    []
  );

  const { data, isLoading, error } = useGetCompanySearchQuery(searchParams, {
    suppressGlobalError: true,
  });
  const { data: recommendedData, isLoading: isRecommendedLoading } = useGetCompanySearchQuery(
    recommendedSearchParams,
    {
      suppressGlobalError: true,
    }
  );

  // API 응답에서 companies 추출 (guestApi 인터셉터가 response.data를 반환하므로)
  const companies = useMemo(() => {
    type CompanySearchPayload = {
      data?: { companies?: Company[] };
      companies?: Company[];
    };
    const payload = data as CompanySearchPayload | undefined;

    if (payload?.data?.companies) {
      return payload.data.companies;
    }
    if (payload?.companies) {
      return payload.companies;
    }
    return [];
  }, [data]);

  const recommendedCompanies = useMemo(() => {
    type CompanySearchPayload = {
      data?: { companies?: Company[] };
      companies?: Company[];
    };
    const payload = recommendedData as CompanySearchPayload | undefined;

    if (payload?.data?.companies) {
      return payload.data.companies;
    }
    if (payload?.companies) {
      return payload.companies;
    }
    return [];
  }, [recommendedData]);

  // 필터링된 companies (한 번만 계산)
  const filteredCompanies = useMemo(() => {
    const byKeyword = filterCompanies(companies, keyword);
    if (selectedCategories.length === 0) return byKeyword;

    const categoryNameById = new Map(CATEGORIES.map((category) => [category.id, category.name]));
    const selectedTokens = selectedCategories.flatMap((id) => {
      const name = categoryNameById.get(id);
      return [id, name].filter(Boolean).map((value) => normalizeSearchTerm(String(value)));
    });

    return byKeyword.filter((company) =>
      (company.tags || []).some((tag) => {
        const tagValue =
          typeof tag === 'string'
            ? tag
            : typeof (tag as { name?: string }).name === 'string'
              ? (tag as { name: string }).name
              : '';
        return selectedTokens.some((token) => normalizeSearchTerm(tagValue).includes(token));
      })
    );
  }, [companies, keyword, selectedCategories]);

  const hasActiveFilters =
    keyword.trim().length > 0 || selectedCategories.length > 0 || Boolean(selectedRange.start);
  const defaultSkeletonCount = isDesktop
    ? DEFAULT_DESKTOP_SKELETON_COUNT
    : DEFAULT_MOBILE_SKELETON_COUNT;

  useEffect(() => {
    if (isLoading || error) return;
    setLastResolvedResultCount(filteredCompanies.length);
  }, [isLoading, error, filteredCompanies.length]);

  const companySkeletonCount = useMemo(() => {
    if (lastResolvedResultCount === null) return defaultSkeletonCount;
    return normalizeSkeletonCount(lastResolvedResultCount, defaultSkeletonCount);
  }, [defaultSkeletonCount, lastResolvedResultCount]);

  const shouldKeepNoResultsVisibleWhileLoading =
    hasActiveFilters && lastResolvedResultCount === 0 && filteredCompanies.length === 0;
  const shouldShowCompanyLoadingSkeleton =
    isLoading && !shouldKeepNoResultsVisibleWhileLoading && companySkeletonCount > 0;
  const shouldShowNoResults =
    !error &&
    hasActiveFilters &&
    filteredCompanies.length === 0 &&
    (!isLoading || shouldKeepNoResultsVisibleWhileLoading);
  const recommendedSkeletonCount = normalizeSkeletonCount(
    recommendedCompanies.length || DEFAULT_RECOMMENDED_SKELETON_COUNT,
    DEFAULT_RECOMMENDED_SKELETON_COUNT
  );

  // 디버깅: API 응답 구조 확인
  useEffect(() => {
    if (!data) return;
    console.log('[CompanyPage] API Response:', data);
    console.log('[CompanyPage] Companies:', companies);
    console.log('[CompanyPage] Selected Categories:', selectedCategories);
    console.log('[CompanyPage] Filtered Companies:', filteredCompanies);
    console.log(
      '[CompanyPage] Sample tags:',
      companies.slice(0, 5).map((company) => ({
        id: company.id,
        name: company.name,
        tags: company.tags,
      }))
    );
  }, [data, companies, filteredCompanies, selectedCategories]);

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };

  const handleSearch = () => {
    setKeyword(inputValue);
  };

  const buildSearchQuery = () => {
    const query: Record<string, string> = {};
    const searchTerm = inputValue.trim() || keyword.trim();

    if (searchTerm) {
      query.q = searchTerm;
    }

    if (selectedCategories.length > 0) {
      query.categories = selectedCategories.join(',');
    }

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
    }

    return query;
  };

  const handleGoToSearch = () => {
    router.push({
      pathname: `/${currentLocale}${ROUTES.SEARCH}`,
      query: buildSearchQuery(),
    });
  };

  const handleDateSelect = () => {
    handleGoToSearch();
  };

  const handleToggleCategory = (categoryId: string) => {
    const allCategoryIds = CATEGORIES.filter((category) => category.id !== 'all-care').map(
      (category) => category.id
    );
    const isAllSelected =
      allCategoryIds.length > 0 && selectedCategories.length === allCategoryIds.length;

    const updatedCategories =
      categoryId === 'all-care'
        ? isAllSelected
          ? []
          : allCategoryIds
        : selectedCategories.includes(categoryId)
          ? selectedCategories.filter((id) => id !== categoryId)
          : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);

    // URL 업데이트
    const query: Record<string, string> = {
      q: keyword || '',
    };
    if (updatedCategories.length > 0) {
      query.categories = updatedCategories.join(',');
    }

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
    }

    router.push(
      {
        pathname: `/${currentLocale}/company`,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);

    // URL 업데이트
    const query: Record<string, string> = { q: keyword || '' };

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
    }

    router.push(
      {
        pathname: `/${currentLocale}/company`,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    const debounced = debounce((value: string) => {
      setKeyword(value);
    }, 300);
    debounced(inputValue);
    return debounced.cancel;
  }, [inputValue]);

  return (
    <>
      <Meta {...meta} />
      <Layout
        isAppBarExist={false}
        title={t('title')}
        style={{ backgroundColor: theme.colors.bg_surface1 }}
        scrollMode="page"
      >
        {isDesktop ? (
          <div css={desktopHeader}>
            <DesktopAppBar
              onSearchChange={handleValueChange}
              onSearch={handleSearch}
              showSearch={false}
              sticky={false}
            />
          </div>
        ) : (
          <AppBar
            onBackClick={router.back}
            logo="light"
            leftButton={true}
            buttonType="white"
            backgroundColor="green"
          />
        )}

        {isDesktop ? (
          <>
            <div css={desktopSearchArea}>
              <div css={desktopSearchForm}>
                <div css={desktopSearchField} onClick={handleGoToSearch}>
                  <GnbSearchActive width={20} height={20} />
                  <input
                    value={inputValue}
                    onChange={(event) => handleValueChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleGoToSearch();
                    }}
                    placeholder={tCommon('search.addressPlaceholder')}
                    css={desktopSearchInput}
                  />
                </div>
                <div css={desktopDivider} />
                <button type="button" css={desktopSearchButton} onClick={handleDateSelect}>
                  <GnbCalendarActive width={18} height={18} />
                  <span>{dateText}</span>
                </button>
              </div>
            </div>
            <div css={desktopFilterArea}>
              <FilterBar
                selectedCategories={selectedCategories}
                selectedRange={selectedRange}
                onDateSelect={handleDateSelect}
                onToggleCategory={handleToggleCategory}
                onClearAll={handleClearAll}
                variant="light"
                showDate={false}
                layout="stacked"
                categories={CATEGORIES}
                centered={true}
                sticky={false}
              />
            </div>
          </>
        ) : (
          <>
            <div css={searchBarWrapper} onClick={handleGoToSearch}>
              <SearchBar
                value={inputValue}
                onValueChange={handleValueChange}
                onSearch={handleGoToSearch}
                placeholder={tCommon('search.addressPlaceholder')}
              />
            </div>
            <FilterBar
              selectedCategories={selectedCategories}
              selectedRange={selectedRange}
              onDateSelect={handleDateSelect}
              onToggleCategory={handleToggleCategory}
              onClearAll={handleClearAll}
              sticky={false}
            />
          </>
        )}

        <div css={wrapper}>
          {/* 로딩 상태 */}
          {shouldShowCompanyLoadingSkeleton && (
            <CompanyCardSkeletonList size="default" layout="grid" count={companySkeletonCount} />
          )}
          {error && <PageErrorEmpty error={error} fallbackMessage={t('loadFail')} />}

          {/* 검색 결과가 없을 때 (키워드가 있고 필터링 결과가 없을 때) */}
          {shouldShowNoResults && (
            <div css={recommendedSection}>
              <NoResults
                title={
                  keyword.trim().length > 0 ? t('noResultsTitle', { keyword }) : t('list.noResults')
                }
                subtitle={t('noResultsSubtitle')}
              />
              {isRecommendedLoading ? (
                <CompanyCardSkeletonList
                  title={tCommon('home.recommendedTitle')}
                  count={recommendedSkeletonCount}
                  size="compact"
                  layout="horizontal"
                />
              ) : (
                <CompanyList
                  title={tCommon('home.recommendedTitle')}
                  containerCss={recommendedList}
                  cardSize="compact"
                  companies={recommendedCompanies.map((company) => ({
                    hospital_id: company.id,
                    hospital_name: company.name,
                    address: company.address,
                    rating: Number(company.rating_average || 0),
                    image_url: company.photos?.[0] || '/default.png',
                    images: company.photos || [],
                    departments: company.tags,
                    is_exclusive: company.is_exclusive,
                  }))}
                />
              )}
            </div>
          )}

          {/* 업체 리스트 표시 (필터링된 결과) */}
          {!isLoading && !error && filteredCompanies.length > 0 && (
            <div css={cardsGrid}>
              {filteredCompanies.map((company) => (
                <div key={company.id} css={cardItem}>
                  <CompanyCard
                    companyId={company.id}
                    companyImage={company.photos?.[0] || '/default.png'}
                    companyName={company.name || ''}
                    badges={company.tags || []}
                    companyAddress={company.address || ''}
                    isExclusive={company.is_exclusive}
                    fixedHeight={true}
                    onClick={(companyId: number) => {
                      router.push(`/${currentLocale}${ROUTES.COMPANY_DETAIL(companyId)}`);
                    }}
                    images={company.photos || []}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 데이터가 없을 때 (로딩 완료, 에러 없음, 데이터 없음, 키워드 없음) */}
          {!isLoading && !error && companies.length === 0 && !hasActiveFilters && (
            <Empty title={t('emptyList')} />
          )}
        </div>
        <GNB />
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CompanyPageProps> = withI18nGssp(
  async ({ query, resolvedUrl }) => {
    const q = typeof query.q === 'string' ? query.q.trim() : '';
    const canonicalPath = resolvedUrl.split('?')[0] || '/company';

    return {
      props: {
        initialKeyword: q,
        initialCanonicalPath: canonicalPath,
      },
    };
  }
);

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  overflow-x: hidden;

  width: 100%;
  padding: 24px 20px 80px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    gap: 32px;
    padding: 40px 60px 120px;
    align-items: stretch;
    margin: 0 auto;
  }
`;

export const searchBarWrapper = css`
  background-color: ${theme.colors.primary80};
`;

export const desktopHeader = css`
  background-color: ${theme.colors.bg_surface1};
  position: static;
  top: auto;
`;

export const desktopSearchArea = css`
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 24px 60px 16px;
`;

export const desktopFilterArea = css`
  /* max-width: 1200px; */
  margin: 0 auto;
  padding: 0 60px;
`;

export const desktopSearchForm = css`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px 20px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 999px;
  background-color: ${theme.colors.white};
  box-shadow: 0 8px 24px rgba(15, 23, 20, 0.08);
`;

export const desktopSearchField = css`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  color: ${theme.colors.text_primary};
`;

export const desktopSearchInput = css`
  flex: 1;
  font-size: 16px;
  color: ${theme.colors.text_primary};

  &::placeholder {
    color: ${theme.colors.text_secondary};
  }
`;

export const desktopSearchButton = css`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: ${theme.colors.text_primary};
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
`;

export const desktopDivider = css`
  width: 1px;
  height: 24px;
  background-color: ${theme.colors.border_default};
`;

export const cardItem = css`
  width: 100%;
  display: flex;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    justify-content: stretch;
  }
`;

export const cardsGrid = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(3, 353px);
    justify-content: center;
    gap: 32px;
  }
`;

export const recommendedSection = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const recommendedList = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    margin: 0 auto;
  }
`;
export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
