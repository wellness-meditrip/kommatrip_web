export interface PostClinicReviewRequestBody {
  hospital_id: number;
  user_id: number;
  doctor_id: number;
  doctor_name: string;
  title: string;
  content: string;
  rating: number;
  keywords: keyword[];
  images: string[];
}
export interface keyword {
  category: string;
  keyword_code: string;
  keyword_name: string;
  is_positive: boolean;
  // id: number;
  // review_id: number;
}
export interface PostClinicReviewResponse {
  success: boolean;
  message: string;
  data: string;
}
export interface GetClinicReviewsParams {
  hospital_id: number;
  limit?: number; //size
  offset?: number; //page
}

export interface GetReviewResponse {
  items: ClinicReview[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ClinicReview {
  review_id: number;
  hospital_id: number;
  user_id: number;
  doctor_id: number;
  doctor_name: string;
  title: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
  keyword_count: number;
  image_count: number;
}
