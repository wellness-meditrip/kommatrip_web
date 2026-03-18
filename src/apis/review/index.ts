import {
  PostClinicReviewRequestBody,
  PostClinicReviewResponse,
  GetReviewDetailResponse,
  PutReviewRequestBody,
  PutReviewResponse,
  GetMyReviewsParams,
  GetMyReviewsResponse,
  UpdateMyReviewRequestBody,
  UpdateMyReviewResponse,
  ReplaceReviewImagesRequestBody,
  ReplaceReviewImagesResponse,
  DeleteReviewResponse,
  ReportReviewRequestBody,
  ReportReviewResponse,
  GetCompanyReviewsParams,
  GetCompanyReviewsResponse,
  GetGuestCompanyReviewsParams,
  GetGuestCompanyReviewsResponse,
} from '@/models/review';
import { GetClinicReviewsParams, GetReviewResponse } from '@/models/review';
import { api, bffApi, guestApi } from '@/apis/config';

export const postClinicReview = async (body: PostClinicReviewRequestBody) => {
  return await bffApi.post<PostClinicReviewResponse>('/api/reviews/', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getClinicReviews = async (params: GetClinicReviewsParams) => {
  return await api.get<GetReviewResponse>('/api/v1/reviews', { params });
};

export const getReviewDetail = async (reviewId: number) => {
  return await api.get<GetReviewDetailResponse>(`/api/v1/reviews/${reviewId}`);
};

export const putReview = async (reviewId: number, body: PutReviewRequestBody) => {
  return await bffApi.put<PutReviewResponse>(`/api/reviews/v1/${reviewId}`, body);
};

export const getMyReviews = async (params: GetMyReviewsParams) => {
  return await bffApi.get<GetMyReviewsResponse>('/api/reviews/me', { params });
};

export const updateMyReview = async (reviewId: number, body: UpdateMyReviewRequestBody) => {
  return await bffApi.put<UpdateMyReviewResponse>(`/api/reviews/${reviewId}`, body);
};

export const replaceReviewImages = async (
  reviewId: number,
  body: ReplaceReviewImagesRequestBody
) => {
  return await bffApi.put<ReplaceReviewImagesResponse>(`/api/reviews/${reviewId}/images`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteReview = async (reviewId: number) => {
  return await bffApi.delete<DeleteReviewResponse>(`/api/reviews/${reviewId}`);
};

export const reportReview = async (reviewId: number, body: ReportReviewRequestBody) => {
  return await bffApi.post<ReportReviewResponse>(`/api/reviews/${reviewId}/report`, body);
};

export const reportGuestReview = async (guestReviewId: number, body: ReportReviewRequestBody) => {
  return await bffApi.post<ReportReviewResponse>(
    `/api/reviews/guest-reviews/${guestReviewId}/report`,
    body
  );
};

// 업체 리뷰 조회
export const getCompanyReviews = async (params: GetCompanyReviewsParams) => {
  const { companyId, skip, limit, with_photos, my_country_only, country, tag } = params;

  const queryParams: Record<string, string | number | boolean> = {};
  if (skip !== undefined) queryParams.skip = skip;
  if (limit !== undefined) queryParams.limit = limit;
  if (with_photos !== undefined) queryParams.with_photos = with_photos;
  if (my_country_only !== undefined) queryParams.my_country_only = my_country_only;
  if (country) queryParams.country = country;
  if (tag) queryParams.tag = tag;

  return await guestApi.get<GetCompanyReviewsResponse>(`/review/non/reviews/company/${companyId}`, {
    params: queryParams,
  });
};

// 가리뷰 조회
export const getGuestCompanyReviews = async (params: GetGuestCompanyReviewsParams) => {
  const { companyId, skip, limit, with_photos, my_country_only, country, tags } = params;

  const queryParams: Record<string, string | number | boolean> = {};
  if (skip !== undefined) queryParams.skip = skip;
  if (limit !== undefined) queryParams.limit = limit;
  if (with_photos !== undefined) queryParams.with_photos = with_photos;
  if (my_country_only !== undefined) queryParams.my_country_only = my_country_only;
  if (country) queryParams.country = country;
  if (tags) queryParams.tags = tags;

  return await guestApi.get<GetGuestCompanyReviewsResponse>(
    `/non/guest-reviews/company/${companyId}`,
    {
      params: queryParams,
    }
  );
};
