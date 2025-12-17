import {
  PostClinicReviewRequestBody,
  PostClinicReviewResponse,
  GetReviewDetailResponse,
  PutReviewRequestBody,
  PutReviewResponse,
} from '@/models/review';
import { GetClinicReviewsParams, GetReviewResponse } from '@/models/review';
import { api } from '@/apis/config';

export const postClinicReview = async (body: PostClinicReviewRequestBody) => {
  return await api.post<PostClinicReviewResponse>('/api/v1/reviews', body);
};

export const getClinicReviews = async (params: GetClinicReviewsParams) => {
  return await api.get<GetReviewResponse>('/api/v1/reviews', { params });
};

export const getReviewDetail = async (reviewId: number) => {
  return await api.get<GetReviewDetailResponse>(`/api/v1/reviews/${reviewId}`);
};

export const putReview = async (reviewId: number, body: PutReviewRequestBody) => {
  return await api.put<PutReviewResponse>(`/api/v1/reviews/${reviewId}`, body);
};
