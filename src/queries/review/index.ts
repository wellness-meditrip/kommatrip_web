import { useMutation, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { PostClinicReviewRequestBody, PutReviewRequestBody } from '@/models';
import { postClinicReview, getReviewDetail, putReview } from '@/apis';
import { getClinicReviews } from '@/apis/review';
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
