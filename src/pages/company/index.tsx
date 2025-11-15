import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import { useEffect, useState, useMemo } from 'react';
import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import {
  SearchBar,
  CompanyCard,
  CompanyList,
  Loading,
  NoResults,
  FilterBar,
  GNB,
} from '@/components';
import { useGetCompanySearchQuery } from '@/queries/company';
import { ROUTES } from '@/constants/commons/routes';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { filterCompanies } from '@/utils/search';

const mockRatings = [4.3, 4.1, 3.9, 3.8];

// 업체 리스트 페이지
export default function CompanyPage() {
  const router = useRouter();
  const { q, categories, date } = router.query;
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // URL 쿼리 파라미터에서 필터 정보 읽어오기
  useEffect(() => {
    if (q && typeof q === 'string') {
      setInputValue(q);
      setKeyword(q);
    }

    if (categories && typeof categories === 'string') {
      setSelectedCategories(categories.split(',').filter(Boolean));
    }

    if (date && typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
  }, [q, categories, date]);

  const searchParams = useMemo(
    () => ({
      search_term: keyword || '',
      tags: selectedCategories.length > 0 ? selectedCategories : null,
      location: null,
      skip: 0,
      limit: 20,
    }),
    [keyword, selectedCategories]
  );

  const recommendedSearchParams = useMemo(
    () => ({
      search_term: '',
      tags: null,
      location: null,
      skip: 0,
      limit: 4,
    }),
    []
  );

  const { data, isLoading, error } = useGetCompanySearchQuery(searchParams);
  const { data: recommendedData } = useGetCompanySearchQuery(recommendedSearchParams);

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };

  const handleDateSelect = () => {
    router.push(ROUTES.SEARCH);
  };

  const handleToggleCategory = (categoryId: string) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);

    // URL 업데이트
    const query: Record<string, string> = {
      q: keyword || '',
      categories: updatedCategories.join(','),
    };

    if (selectedDate) {
      query.date = selectedDate.toISOString().split('T')[0];
    }

    router.push(
      {
        pathname: '/company',
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);

    // URL 업데이트
    const query: Record<string, string> = {
      q: keyword || '',
    };

    if (selectedDate) {
      query.date = selectedDate.toISOString().split('T')[0];
    }

    router.push(
      {
        pathname: '/company',
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
    <Layout isAppBarExist={false}>
      <AppBar onBackClick={router.back} logo="light" backgroundColor="green" />
      <div css={searchBarWrapper}>
        <SearchBar value={inputValue} onValueChange={handleValueChange} />
      </div>

      <FilterBar
        selectedCategories={selectedCategories}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onToggleCategory={handleToggleCategory}
        onClearAll={handleClearAll}
      />
      <div css={wrapper}>
        {/* 로딩 상태 */}
        {isLoading && <Loading title="병원 내역을 불러오고 있어요" />}
        {error && <p>에러 발생!</p>}

        {/* 검색 결과가 없을 때 */}
        {!isLoading &&
          !error &&
          data?.data?.companies &&
          filterCompanies(data.data.companies, keyword).length === 0 &&
          keyword.trim() && (
            <>
              <NoResults
                title={`No results for "${keyword}"`}
                subtitle="Oops! We couldn't find what you're looking for."
              />
              <CompanyList
                title="Recommended"
                companies={
                  recommendedData?.data?.companies?.map((company, index) => ({
                    hospital_id: company.id,
                    hospital_name: company.name,
                    address: company.address,
                    rating: mockRatings[index] || 4.0,
                    image_url: '/default.png',
                    departments: company.tags,
                  })) || []
                }
              />
            </>
          )}

        {/* 업체 리스트 표시 (필터링) */}
        {data?.data?.companies &&
          filterCompanies(data.data.companies, keyword).map((company) => (
            <CompanyCard
              key={company.id}
              companyId={company.id}
              badges={company.tags || []}
              onClick={(companyId: number) => {
                router.push(ROUTES.COMPANY_DETAIL(companyId));
              }}
              companyImage="/default.png"
              companyName={company.name || ''}
              companyAddress={company.address || ''}
            />
          ))}
      </div>
      <GNB />
    </Layout>
  );
}

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  overflow-y: auto;
  overflow-x: hidden;

  width: 100%;
  height: 100%;
  padding: 24px 20px 80px;

  background-color: ${theme.colors.bg_surface1};
`;

export const searchBarWrapper = css`
  background-color: ${theme.colors.primary80};
`;
export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
