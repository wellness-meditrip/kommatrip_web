import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import { useEffect, useState, useMemo } from 'react';
import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import SearchBar from '@/components/search/search-bar';
import CompanyCard from '@/components/company/company-card';
import { TextButton } from '@/components/text-button';
import { Text } from '@/components/text';
import { ArrowUpdown } from '@/icons';
import { useGetCompanySearchQuery } from '@/queries/company';
import { ROUTES } from '@/constants/commons/routes';
import { Loading, NoResults } from '@/components/common';
import { SortModal } from '@/components/company/sort-modal';
import { RecommendedCompanies } from '@/components/company/recommended-companies';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { filterCompanies, sortCompanies } from '@/utils/search';

const mockRatings = [4.3, 4.1, 3.9, 3.8];

// 업체 리스트 페이지
export default function ClinicPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedSort, setSelectedSort] = useState('rating_low');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const searchParams = useMemo(
    () => ({
      search_term: '',
      tags: null,
      location: null,
      skip: 0,
      limit: 20,
    }),
    []
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

  const handleSortClick = () => {
    setIsSortModalOpen(true);
  };

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
  };

  const getSortLabel = (sortId: string) => {
    switch (sortId) {
      case 'rating_high':
        return '별점 높은 순';
      case 'rating_low':
        return '별점 낮은 순';
      case 'review_count':
        return '리뷰 많은 순';
      default:
        return '별점 낮은 순';
    }
  };

  useEffect(() => {
    const debounced = debounce((value: string) => {
      setKeyword(value);
    }, 300);
    debounced(inputValue);
    return debounced.cancel;
  }, [inputValue]);

  return (
    <Layout isAppBarExist={true}>
      <AppBar onBackClick={router.back} showBackButton={false} logo={true} />
      <SearchBar onValueChange={handleValueChange} />
      <div css={wrapper}>
        {/* 정렬 버튼 (항상 표시) */}
        {!isLoading && data?.data?.companies && (
          <TextButton
            icons={{ prefix: <ArrowUpdown width={16} height={16} /> }}
            onClick={handleSortClick}
          >
            <Text typo="button_M" color="primary50">
              {getSortLabel(selectedSort)}
            </Text>
          </TextButton>
        )}

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
                title="검색하신 한의원이 없어요"
                subtitle="대신 비슷한 한의원을 찾아봤어요!"
              />
              <RecommendedCompanies
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

        {/* 업체 리스트 표시 (필터링 + 정렬 적용) */}
        {data?.data?.companies &&
          sortCompanies(filterCompanies(data.data.companies, keyword), selectedSort).map(
            (company) => (
              <CompanyCard
                key={company.id}
                clinicId={company.id}
                badges={company.tags}
                onClick={(companyId: number) => {
                  router.push(ROUTES.COMPANY_DETAIL(companyId));
                }}
                clinicImage="/default.png"
                clinicName={company.name}
                clinicAddress={company.address}
              />
            )
          )}
        <SortModal
          isOpen={isSortModalOpen}
          onClose={() => setIsSortModalOpen(false)}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
        />
      </div>
    </Layout>
  );
}

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  overflow-y: auto;

  width: 100%;
  height: 100%;
  padding: 104px 20px 80px;

  background-color: ${theme.colors.bg_surface1};
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
