import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import {
  PostClinicReviewRequestBody,
  PutReviewRequestBody,
  GetCompanyReviewsParams,
  GetGuestCompanyReviewsParams,
  GetGuestCompanyReviewsResponse,
  GetMyReviewsParams,
  GetMyReviewsResponse,
  UpdateMyReviewRequestBody,
  ReplaceReviewImagesRequestBody,
  ReportReviewRequestBody,
  ReportReviewResponse,
} from '@/models';
import { postClinicReview, getReviewDetail, putReview } from '@/apis';
import {
  getClinicReviews,
  getCompanyReviews,
  getGuestCompanyReviews,
  getMyReviews,
  updateMyReview,
  replaceReviewImages,
  deleteReview,
  reportReview,
  reportGuestReview,
} from '@/apis/review';
import { AxiosError } from 'axios';

export const usePostClinicReviewMutation = () => {
  return useMutation({
    mutationKey: QUERY_KEYS.POST_CLINIC_REVIEW,
    mutationFn: async (body: PostClinicReviewRequestBody) => {
      try {
        return await postClinicReview(body);
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.data?.error) {
          throw error.response.data.error;
        }
        throw error;
      }
    },
  });
};

const PAGE_SIZE = 20;

export const getCompanyReviewsQueryKey = (params: GetCompanyReviewsParams) =>
  [
    ...QUERY_KEYS.GET_COMPANY_REVIEWS,
    params.companyId,
    {
      skip: params.skip ?? null,
      limit: params.limit ?? null,
      with_photos: params.with_photos ?? null,
      my_country_only: params.my_country_only ?? null,
      country: params.country ?? null,
      tag: params.tag ?? null,
    },
  ] as const;

export const getGuestCompanyReviewsInfiniteQueryKey = (params: GetGuestCompanyReviewsParams) =>
  [
    ...QUERY_KEYS.GET_COMPANY_REVIEWS,
    'guest',
    params.companyId,
    {
      skip: params.skip ?? null,
      limit: params.limit ?? null,
      with_photos: params.with_photos ?? null,
      my_country_only: params.my_country_only ?? null,
      country: params.country ?? null,
      tags: params.tags ?? null,
    },
  ] as const;

export const createGuestCompanyReviewsInfiniteQueryOptions = (
  params: GetGuestCompanyReviewsParams
) =>
  infiniteQueryOptions({
    queryKey: getGuestCompanyReviewsInfiniteQueryKey(params),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      getGuestCompanyReviews({
        ...params,
        skip: pageParam,
        limit: params.limit ?? PAGE_SIZE,
      }),
    getNextPageParam: (
      lastPage: GetGuestCompanyReviewsResponse,
      allPages: GetGuestCompanyReviewsResponse[]
    ) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + page.reviews.length, 0);
      const hasNext = totalLoaded < lastPage.total;
      return hasNext ? totalLoaded : undefined;
    },
    enabled: !!params.companyId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useGetClinicReviewInfiniteQuery = (hospitalId: number) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.GET_CLINIC_REVIEWS, hospitalId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      console.log('📥 fetching reviews with offset:', pageParam); // ✅ 로그
      const res = await getClinicReviews({
        hospital_id: hospitalId,
        limit: PAGE_SIZE,
        offset: pageParam,
      });
      console.log('📦 fetched review page:', res); // ✅ 로그
      return res;
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.reduce((sum, page) => sum + page.items.length, 0);
      const hasNext = nextOffset < lastPage.total;
      console.log('⏭ hasNextPage?', hasNext ? `yes, offset = ${nextOffset}` : 'no more');
      return hasNext ? nextOffset : undefined; // ✅ 다음 offset 반환 or 끝
    },
    enabled: !!hospitalId,
  });
};

export const useGetReviewDetailQuery = (reviewId: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.GET_REVIEW_DETAIL, reviewId],
    queryFn: () => getReviewDetail(reviewId),
    enabled: !!reviewId,
  });
};

export const usePutReviewMutation = () => {
  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body: PutReviewRequestBody }) =>
      putReview(reviewId, body),
    mutationKey: QUERY_KEYS.PUT_REVIEW,
  });
};

export const useGetMyReviewsQuery = (params: GetMyReviewsParams, enabled: boolean = true) => {
  return useQuery<GetMyReviewsResponse>({
    queryKey: [...QUERY_KEYS.GET_MY_REVIEWS, params.skip, params.limit],
    queryFn: () => getMyReviews(params),
    enabled,
  });
};

export const useUpdateMyReviewMutation = () => {
  return useMutation({
    mutationKey: QUERY_KEYS.UPDATE_MY_REVIEW,
    mutationFn: ({ reviewId, body }: { reviewId: number; body: UpdateMyReviewRequestBody }) =>
      updateMyReview(reviewId, body),
  });
};

export const useReplaceReviewImagesMutation = () => {
  return useMutation({
    mutationKey: QUERY_KEYS.REPLACE_REVIEW_IMAGES,
    mutationFn: ({ reviewId, body }: { reviewId: number; body: ReplaceReviewImagesRequestBody }) =>
      replaceReviewImages(reviewId, body),
  });
};

export const useDeleteReviewMutation = () => {
  return useMutation({
    mutationKey: QUERY_KEYS.DELETE_REVIEW,
    mutationFn: ({ reviewId }: { reviewId: number }) => deleteReview(reviewId),
  });
};

export const useReportReviewMutation = () => {
  return useMutation<
    ReportReviewResponse,
    unknown,
    { reviewId: number; body: ReportReviewRequestBody }
  >({
    mutationKey: QUERY_KEYS.REPORT_REVIEW,
    mutationFn: ({ reviewId, body }) => reportReview(reviewId, body),
  });
};

export const useReportGuestReviewMutation = () => {
  return useMutation<
    ReportReviewResponse,
    unknown,
    { reviewId: number; body: ReportReviewRequestBody }
  >({
    mutationKey: QUERY_KEYS.REPORT_GUEST_REVIEW,
    mutationFn: ({ reviewId, body }) => reportGuestReview(reviewId, body),
  });
};

// 업체 리뷰 조회 (무한 스크롤)
export const useGetCompanyReviewsInfiniteQuery = (params: GetCompanyReviewsParams) => {
  return useInfiniteQuery({
    queryKey: getCompanyReviewsQueryKey(params),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getCompanyReviews({
        ...params,
        skip: pageParam as number,
        limit: params.limit ?? PAGE_SIZE,
      });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + page.reviews.length, 0);
      const hasNext = totalLoaded < lastPage.total;
      return hasNext ? totalLoaded : undefined;
    },
    enabled: !!params.companyId,
  });
};

// 업체 리뷰 조회 (일반 쿼리)
export const useGetCompanyReviewsQuery = (params: GetCompanyReviewsParams) => {
  return useQuery({
    queryKey: getCompanyReviewsQueryKey(params),
    queryFn: () => getCompanyReviews(params),
    enabled: !!params.companyId,
  });
};

// 가리뷰 조회 (무한 스크롤)
export const useGetGuestCompanyReviewsInfiniteQuery = (params: GetGuestCompanyReviewsParams) => {
  return useInfiniteQuery(createGuestCompanyReviewsInfiniteQueryOptions(params));
};
