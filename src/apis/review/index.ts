import { reviewApi } from '@/apis';
import { PostClinicReviewRequestBody, PostClinicReviewResponse } from '@/models/review';
import { GetClinicReviewsParams, GetReviewResponse } from '@/models/review';
import { guestReviewApi } from '../config';

export const postClinicReview = async (body: PostClinicReviewRequestBody) => {
  return await reviewApi.post<PostClinicReviewResponse>('/api/v1/reviews', body);
};

export const getClinicReviews = async (params: GetClinicReviewsParams) => {
  return await guestReviewApi.get<GetReviewResponse>('/api/v1/reviews', { params });
};
