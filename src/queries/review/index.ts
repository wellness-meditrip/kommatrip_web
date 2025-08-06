import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { PostClinicReviewRequestBody } from '@/models';
import { postClinicReview } from '@/apis';
import { getClinicReviews } from '@/apis/review';
import { GetClinicReviewsParams } from '@/models/review';
import { AxiosError } from 'axios';

export const usePostClinicReviewMutation = () => {
  return useMutation({
    mutationKey: QUERY_KEYS.POST_CLINIC_REVIEW,
    mutationFn: async (body: PostClinicReviewRequestBody) => {
      try {
        return await postClinicReview(body);
      } catch (error: any) {
        if (error instanceof AxiosError && error.response?.data?.error) {
          throw error.response.data.error;
        }
        throw error;
      }
    },
  });
};

// export const getUserGroomingMyReviewListInfiniteQuery = () => {
//   return useInfiniteQuery({
//     queryKey: QUERY_KEYS.GET_USER_GROOMING_MY_REVIEW_LIST,
//     initialPageParam: 0,
//     queryFn: ({ pageParam = 0 }) => {
//       return getUserGroomingMyReviewList({ page: pageParam, size: PAGE_SIZE });
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       return lastPage.reviewList.length === PAGE_SIZE ? allPages.length + 1 : undefined;
//     },
//   });
// };

// export const getClinicReviewInfiniteQuery = (hospitalId: number) => {
//   return useInfiniteQuery({
//     queryKey: [...QUERY_KEYS.GET_CLINIC_REVIEWS, hospitalId],
//     initialPageParam: 0,
//     queryFn: async ({ pageParam = 0 }) => {
//       return getClinicReviews({ offset: pageParam, limit: offset});
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       return lastPage.offset == PAGE_SIZE ? all
//     //   reviewList.length === PAGE_SIZE ? allPages.length + 1 : undefined;
//     },
//   });
// };

const PAGE_SIZE = 20;

export const getClinicReviewInfiniteQuery = (hospitalId: number) => {
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
