import {
  PostClinicReviewRequestBody,
  PostClinicReviewResponse,
  GetReviewDetailResponse,
  PutReviewRequestBody,
  PutReviewResponse,
} from '@/models/review';
import { GetClinicReviewsParams, GetReviewResponse } from '@/models/review';
import { guestReviewApi } from '../config';

export const postClinicReview = async (body: PostClinicReviewRequestBody) => {
  return await guestReviewApi.post<PostClinicReviewResponse>('/api/v1/reviews', body);
};

export const getClinicReviews = async (params: GetClinicReviewsParams) => {
  return await guestReviewApi.get<GetReviewResponse>('/api/v1/reviews', { params });
};

export const getReviewDetail = async (reviewId: number) => {
  return await guestReviewApi.get<GetReviewDetailResponse>(`/api/v1/reviews/${reviewId}`);
};

export const putReview = async (reviewId: number, body: PutReviewRequestBody) => {
  return await guestReviewApi.put<PutReviewResponse>(`/api/v1/reviews/${reviewId}`, body);
};
