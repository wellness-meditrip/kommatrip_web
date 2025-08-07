import { reviewApi } from '@/apis';
import { PostClinicReviewRequestBody, PostClinicReviewResponse } from '@/models/review';

export const postClinicReview = async (body: PostClinicReviewRequestBody) => {
  return await reviewApi.post<PostClinicReviewResponse>('/api/v1/reviews', body);
};
