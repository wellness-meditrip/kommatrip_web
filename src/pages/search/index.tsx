import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  SearchBar,
  Calendar,
  CTAButton,
  DesktopAppBar,
  FilterBar,
  CategoryFilter,
} from '@/components';
import { Layout } from '@/components/layout';
import { theme } from '@/styles';
import { CATEGORIES } from '@/constants/commons/categories';
import { css } from '@emotion/react';
import { ROUTES } from '@/constants';
import { useMediaQuery } from '@/hooks';
import { useTranslations } from 'next-intl';
import { getPublicUtilityI18nStaticProps } from '@/i18n/page-props';

// 검색 페이지
export default function SearchPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const tCommon = useTranslations('common');
  const tSearch = useTranslations('search');

  // URL 쿼리 파라미터에서 초기 검색어 가져오기
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query.q === 'string') {
      setSearchValue(router.query.q);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!router.isReady) return;
    const { date, endDate } = router.query;

    const parseDate = (value?: string | string[]) => {
      if (!value || Array.isArray(value)) return null;
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const nextStart = parseDate(date);
    const nextEnd = parseDate(endDate);

    if (nextStart || nextEnd) {
      setSelectedRange({ start: nextStart, end: nextEnd });
    }
  }, [router.isReady, router.query]);

  const handleSearch = () => {
    const query: Record<string, string> = {};

    if (searchValue.trim()) {
      query.q = searchValue.trim();
    }

    const filteredCategories = selectedCategories.filter((id) => id !== 'all-care');
    if (filteredCategories.length > 0) {
      query.categories = filteredCategories.join(',');
    }

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
    }

    router.push({
      pathname: ROUTES.COMPANY,
      query,
    });
  };

  const handleSeeAll = () => {
    const query: Record<string, string> = {};

    if (searchValue.trim()) {
      query.q = searchValue.trim();
    }

    const filteredCategories = selectedCategories.filter((id) => id !== 'all-care');
    if (filteredCategories.length > 0) {
      query.categories = filteredCategories.join(',');
    }

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
    }

    router.push({
      pathname: ROUTES.COMPANY,
      query,
    });
  };

  const handleRangeSelect = (range: { start: Date | null; end: Date | null }) => {
    setSelectedRange(range);
  };

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCategorySelect = (categoryId: string) => {
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
  };

  return (
    <Layout
      isAppBarExist={false}
      title={tSearch('title')}
      showFooter={false}
      style={{
        backgroundColor: isDesktop ? theme.colors.bg_surface1 : theme.colors.primary80,
      }}
    >
      <div css={wrapper}>
        <div css={desktopAppBar}>
          <DesktopAppBar
            onSearchChange={setSearchValue}
            onSearch={handleSearch}
            showSearch={false}
          />
        </div>
        <div css={mobileAppBar}>
          <AppBar onBackClick={() => router.back()} leftButton={true} buttonType="white" />
        </div>

        {!isDesktop && (
          <SearchBar
            value={searchValue}
            onValueChange={setSearchValue}
            onSearch={handleSearch}
            placeholder={tCommon('search.addressPlaceholder')}
          />
        )}

        <div css={contentContainer}>
          {isDesktop && (
            <div css={desktopSearchWrapper}>
              <SearchBar
                value={searchValue}
                onValueChange={setSearchValue}
                onSearch={handleSearch}
                placeholder={tCommon('search.addressPlaceholder')}
                isLeft={true}
              />
            </div>
          )}
          <div css={categorySection}>
            {isDesktop ? (
              <FilterBar
                selectedCategories={selectedCategories}
                onToggleCategory={handleCategorySelect}
                onClearAll={() => setSelectedCategories([])}
                variant="light"
                showDate={false}
                layout="stacked"
                categories={CATEGORIES}
                centered={true}
              />
            ) : (
              <CategoryFilter
                categories={CATEGORIES}
                selectedCategoryIds={selectedCategories}
                onCategorySelect={handleCategorySelect}
              />
            )}
          </div>

          <div css={calendarSection}>
            <Calendar
              selectedRange={selectedRange}
              onRangeSelect={handleRangeSelect}
              variant={isDesktop ? 'desktop' : 'default'}
            />
          </div>

          <div css={ctaSection}>
            <CTAButton onClick={handleSeeAll}>See all</CTAButton>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const wrapper = css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const desktopAppBar = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
  }
`;

const mobileAppBar = css`
  display: block;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
`;

const contentContainer = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
  padding-bottom: 78px; /* GNB 공간 확보 */

  @media (min-width: ${theme.breakpoints.desktop}) {
    max-width: 980px;
    margin: 0 auto 40px;
    padding: 16px 28px 48px;
    background-color: ${theme.colors.white};
    box-shadow: 0 20px 40px rgb(15 23 20 / 12%);
    border: 1px solid ${theme.colors.border_default};
  }
`;

const categorySection = css`
  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-top: 4px;
  }
`;

const calendarSection = css`
  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-top: 8px;
  }
`;

const ctaSection = css`
  @media (min-width: ${theme.breakpoints.desktop}) {
    align-self: start;
    display: flex;
    width: 100%;
    padding-top: 8px;

    & > div {
      width: 100%;
    }

    & > div > button {
      width: 100%;
    }
  }
`;

const desktopSearchWrapper = css`
  padding: 12px 0 4px;

  & > div {
    max-width: 100%;
  }

  & > div > div {
    margin: 0;
  }
`;

export const getStaticProps = getPublicUtilityI18nStaticProps(['search', 'categories']);
