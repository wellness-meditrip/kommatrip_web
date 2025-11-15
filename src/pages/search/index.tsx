/** @jsxImportSource @emotion/react */
import { useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSearch = () => {
    const query: Record<string, string> = {};

    if (searchValue.trim()) {
      query.q = searchValue.trim();
    }

    const filteredCategories = selectedCategories.filter((id) => id !== 'all-care');
    if (filteredCategories.length > 0) {
      query.categories = filteredCategories.join(',');
    }

    if (selectedDate) {
      query.date = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
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

    if (selectedDate) {
      query.date = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    }

    router.push({
      pathname: ROUTES.COMPANY,
      query,
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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

          <Calendar onDateSelect={handleDateSelect} />

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
