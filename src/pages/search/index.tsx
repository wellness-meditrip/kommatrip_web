/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppBar, SearchBar, CategoryFilter, Calendar, CTAButton } from '@/components';
import { Layout } from '@/components/layout';
import { theme } from '@/styles';
import { CATEGORIES } from '@/constants/commons/categories';
import { css } from '@emotion/react';
import { ROUTES } from '@/constants';

// 검색 페이지
export default function SearchPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all-care']);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  // URL 쿼리 파라미터에서 초기 검색어 가져오기
  useEffect(() => {
    if (router.isReady && router.query.q) {
      setSearchValue(router.query.q as string);
    }
  }, [router.isReady, router.query.q]);

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
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        // 이미 선택된 카테고리면 제거
        return prev.filter((id) => id !== categoryId);
      } else {
        // 선택되지 않은 카테고리면 추가
        return [...prev, categoryId];
      }
    });
  };

  return (
    <Layout isAppBarExist={false} style={{ backgroundColor: theme.colors.primary80 }}>
      <div css={wrapper}>
        <AppBar
          onBackClick={() => router.back()}
          leftButton={true}
          logo="light"
          buttonType="white"
        />

        <SearchBar
          value={searchValue}
          onValueChange={setSearchValue}
          onSearch={handleSearch}
          placeholder="Search for address, location"
        />

        <div css={contentContainer}>
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategoryIds={selectedCategories}
            onCategorySelect={handleCategorySelect}
          />

          <Calendar selectedRange={selectedRange} onRangeSelect={handleRangeSelect} />

          <CTAButton onClick={handleSeeAll}>See all</CTAButton>
        </div>
      </div>
    </Layout>
  );
}

const wrapper = css`
  min-height: 100vh;
`;

const contentContainer = css`
  padding: 0 20px;
  padding-bottom: 78px; /* GNB 공간 확보 */
`;
