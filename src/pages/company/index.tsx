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
  Empty,
  NoResults,
  FilterBar,
  GNB,
} from '@/components';
import { useGetCompanySearchQuery } from '@/queries/company';
import { ROUTES } from '@/constants/commons/routes';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { filterCompanies } from '@/utils/search';
import type { Company } from '@/models';
import { useTranslations } from 'next-intl';

// 업체 리스트 페이지
export default function CompanyPage() {
  const router = useRouter();
  const t = useTranslations('company');
  const { q, categories, date, endDate } = router.query;
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

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

  const { data, isLoading, error } = useGetCompanySearchQuery(searchParams);
  const { data: recommendedData } = useGetCompanySearchQuery(recommendedSearchParams);

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

  // 필터링된 companies (한 번만 계산)
  const filteredCompanies = useMemo(() => {
    return filterCompanies(companies, keyword);
  }, [companies, keyword]);

  // 디버깅: API 응답 구조 확인
  useEffect(() => {
    if (data) {
      console.log('[CompanyPage] API Response:', data);
      console.log('[CompanyPage] Companies:', companies);
      console.log('[CompanyPage] Filtered Companies:', filteredCompanies);
    }
  }, [data, companies, filteredCompanies]);

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

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
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

    if (selectedRange.start) {
      query.date = formatDateParam(selectedRange.start);
    }
    if (selectedRange.end) {
      query.endDate = formatDateParam(selectedRange.end);
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
      <AppBar
        onBackClick={router.back}
        logo="light"
        leftButton={true}
        buttonType="white"
        backgroundColor="green"
      />
      <div css={searchBarWrapper}>
        <SearchBar value={inputValue} onValueChange={handleValueChange} />
      </div>

      <FilterBar
        selectedCategories={selectedCategories}
        selectedRange={selectedRange}
        onDateSelect={handleDateSelect}
        onToggleCategory={handleToggleCategory}
        onClearAll={handleClearAll}
      />
      <div css={wrapper}>
        {/* 로딩 상태 */}
        {isLoading && <Loading title={t('loadingList')} />}
        {error && <Empty title={t('loadFail')} />}

        {/* 검색 결과가 없을 때 (키워드가 있고 필터링 결과가 없을 때) */}
        {!isLoading && !error && filteredCompanies.length === 0 && keyword.trim() && (
          <>
            <NoResults title={t('noResultsTitle', { keyword })} subtitle={t('noResultsSubtitle')} />
            <CompanyList
              title="Recommended"
              companies={
                recommendedData?.data?.companies?.map((company) => ({
                  hospital_id: company.id,
                  hospital_name: company.name,
                  address: company.address,
                  rating: Number(company.rating_average || 0),
                  image_url: company.photos?.[0] || '/default.png',
                  images: company.photos || [],
                  departments: company.tags,
                  is_exclusive: company.is_exclusive,
                })) || []
              }
            />
          </>
        )}

        {/* 업체 리스트 표시 (필터링된 결과) */}
        {!isLoading &&
          !error &&
          filteredCompanies.length > 0 &&
          filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              companyId={company.id}
              companyImage={company.photos?.[0] || '/default.png'}
              companyName={company.name || ''}
              badges={company.tags || []}
              companyAddress={company.address || ''}
              isExclusive={company.is_exclusive}
              fixedHeight={true}
              onClick={(companyId: number) => {
                router.push(ROUTES.COMPANY_DETAIL(companyId));
              }}
              images={company.photos || []}
            />
          ))}

        {/* 데이터가 없을 때 (로딩 완료, 에러 없음, 데이터 없음, 키워드 없음) */}
        {!isLoading && !error && companies.length === 0 && !keyword.trim() && (
          <Empty title={t('emptyList')} />
        )}
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
