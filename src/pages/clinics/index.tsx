import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import { useEffect, useState, useMemo } from 'react';
import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import SearchBar from '@/components/search/search-bar';
import ClinicCard from '@/components/clinic/clinic-card';
import { TextButton } from '@/components/text-button';
import { Text } from '@/components/text';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { ArrowUpdown } from '@/icons';
import { useGetClinicInfiniteQuery } from '@/queries/clinic';
import { ROUTES } from '@/constants/commons/routes';
import { useIntersectionLoad } from '@/hooks/review';
import { Loading, NoResults } from '@/components/common';
import { SortModal } from '@/components/clinic/sort-modal';
import { RecommendedClinics } from '@/components/clinic/recommended-clinics';

const mockRatings = [4.3, 4.1, 3.9, 3.8];

// 병원 리스트 페이지
export default function ClinicPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedSort, setSelectedSort] = useState('rating_low');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const params = useMemo(
    () => ({
      keyword,
      page: 1,
      size: 6,
    }),
    [keyword]
  );

  const recommendedParams = useMemo(
    () => ({
      keyword: '',
      page: 1,
      size: 4,
    }),
    []
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, data } =
    useGetClinicInfiniteQuery(params);

  const { data: recommendedData } = useGetClinicInfiniteQuery(recommendedParams);

  const { loadMoreRef } = useIntersectionLoad({
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
  });

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
    }, 500);
    debounced(inputValue);
    return debounced.cancel;
  }, [inputValue]);

  return (
    <Layout isAppBarExist={true}>
      <AppBar onBackClick={router.back} showBackButton={false} title="한의원" />
      <SearchBar onValueChange={handleValueChange} />
      <div
        css={
          keyword.trim() &&
          data?.pages &&
          data.pages.length > 0 &&
          data.pages[0].hospitals.length === 0
            ? wrapperNoPadding
            : wrapper
        }
      >
        {(!keyword.trim() ||
          (data?.pages && data.pages.length > 0 && data.pages[0].hospitals.length > 0)) && (
          <TextButton
            icons={{ prefix: <ArrowUpdown width={16} height={16} /> }}
            onClick={handleSortClick}
          >
            <Text typo="button_M" color="primary50">
              {getSortLabel(selectedSort)}
            </Text>
          </TextButton>
        )}

        {isLoading && <Loading title="병원 내역을 불러오고 있어요" />}
        {isError && <p>에러 발생!</p>}
        {!isLoading &&
          !isError &&
          data?.pages &&
          data.pages.length > 0 &&
          data.pages[0].hospitals.length === 0 && (
            <>
              <NoResults
                title="검색하신 한의원이 없어요"
                subtitle="대신 비슷한 한의원을 찾아봤어요!"
              />
              <RecommendedClinics
                clinics={
                  recommendedData?.pages?.[0]?.hospitals?.map((clinic, index) => {
                    const detail = clinic.hospital_details?.[0];
                    const mainImage = detail?.images?.find((img) => img.is_main)?.image_url ?? '';

                    return {
                      hospital_id: clinic.hospital_id,
                      hospital_name: clinic.hospital_name,
                      address: clinic.address,
                      rating: mockRatings[index] || 4.0,
                      image_url: mainImage,
                      departments: detail?.departments?.map((d) => d.name) || [],
                    };
                  }) || []
                }
              />
            </>
          )}
        {data?.pages.map(
          (page) =>
            page.hospitals?.map((clinic) => {
              const detail = clinic.hospital_details?.[0];
              const mainImage = detail?.images?.find((img) => img.is_main)?.image_url ?? '';

              return (
                <ClinicCard
                  key={clinic.hospital_id}
                  clinicId={clinic.hospital_id}
                  badges={detail?.departments?.map((d) => d.name) || []}
                  onClick={(clinicId: number) => {
                    router.push(ROUTES.CLINICS_DETAIL(clinicId));
                  }}
                  clinicImage={mainImage}
                  clinicName={clinic.hospital_name}
                  clinicAddress={clinic.address}
                />
              );
            }) || []
        )}
        <div ref={loadMoreRef} css={bottom} />
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
  overflow-y: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: ${theme.colors.bg_surface1};
  padding: 104px 20px 80px;
  gap: 24px;
`;

export const wrapperNoPadding = css`
  overflow-y: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: ${theme.colors.bg_surface1};
  padding: 80px 0 80px;
  gap: 24px;
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
