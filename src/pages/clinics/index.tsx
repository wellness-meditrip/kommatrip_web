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

// 병원 리스트 페이지
export default function ClinicPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');

  const params = useMemo(
    () => ({
      keyword,
      page: 1,
      size: 6,
    }),
    [keyword]
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, data } =
    useGetClinicInfiniteQuery(params);

  const { loadMoreRef } = useIntersectionLoad({
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
  });

  const handleValueChange = (value: string) => {
    setInputValue(value);
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
      <AppBar onBackClick={router.back} showBackButton={false} title="한의원" />
      <SearchBar onValueChange={handleValueChange} />
      <div css={wrapper}>
        <TextButton icons={{ prefix: <ArrowUpdown width={16} height={16} /> }}>
          <Text typo="button_M" color="text_tertiary">
            별점 낮은 순
          </Text>
        </TextButton>

        {isLoading && <p>로딩 중...</p>}
        {isError && <p>에러 발생!</p>}
        {data?.pages.map((page) =>
          page.hospitals.map((clinic) => {
            const detail = clinic.hospital_details?.[0];
            const mainImage = detail?.images?.find((img) => img.is_main)?.image_url ?? '';

            return (
              <ClinicCard
                key={clinic.hospital_id}
                clinicId={clinic.hospital_id}
                badges={detail?.departments.map((d) => d.name)}
                onClick={(clinicId: number) => {
                  router.push(ROUTES.CLINICS_DETAIL(clinicId));
                }}
                clinicImage={mainImage}
                clinicName={clinic.hospital_name}
                clinicAddress={clinic.address}
              />
            );
          })
        )}
        <div ref={loadMoreRef} css={bottom} />
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
export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
