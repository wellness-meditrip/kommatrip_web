import { useMutation } from '@tanstack/react-query';
import { QUERY_KEYS } from '../query-keys';
import { PostClinicReviewRequestBody } from '@/models';
import { postClinicReview } from '@/apis';
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
