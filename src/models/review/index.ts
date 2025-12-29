export type PostClinicReviewRequestBody = FormData;
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
  title?: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
  keyword_count: number;
  image_count: number;
  content?: string;
}

export interface GetReviewDetailResponse {
  hospital_id: number;
  user_id: number;
  doctor_id: number;
  doctor_name: string;
  title: string;
  content: string;
  rating: number;
  review_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  keywords: keyword[];
  images: string[];
}

export interface PutReviewRequestBody {
  title: string;
  content: string;
  rating: number;
  doctor_id: number;
  doctor_name: string;
}

export interface PutReviewResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface GetMyReviewsParams {
  skip?: number;
  limit?: number;
}

export interface MyReviewItem {
  id: number;
  program_id: number;
  company_code: string;
  company_id: number;
  company_name: string;
  company_primary_image_url: string | null;
  content: string;
  ai_consent?: boolean;
  tags: string[];
  created_at: string;
  primary_image_url: string | null;
  image_urls: string[] | null;
  reviewer_username: string;
  reviewer_profile_image_url: string | null;
  visit_date: string | null;
  program_name: string;
  program_price: number;
  duration_minutes: number;
  is_first_visit: boolean | null;
}

export interface GetMyReviewsResponse {
  total: number;
  reviews: MyReviewItem[];
}

export interface UpdateMyReviewRequestBody {
  content?: string;
  ai_consent?: boolean;
  tags?: string[];
}

export interface UpdateMyReviewResponse {
  message: string;
  review: {
    id: number;
    content: string;
    ai_consent: boolean;
    tags: string[];
    primary_image_url: string | null;
    image_urls: string[] | null;
  };
}

export type ReplaceReviewImagesRequestBody = FormData;

export interface ReplaceReviewImagesResponse {
  message: string;
  review: {
    id: number;
    primary_image_url: string | null;
    image_urls: string[] | null;
  };
}

export interface DeleteReviewResponse {
  message: string;
}

export type ReportReviewReason =
  | 'commercial_promotional'
  | 'pornographic_harmful'
  | 'personal_attack_offensive'
  | 'personal_information_exposure'
  | 'other';

export interface ReportReviewRequestBody {
  reason: ReportReviewReason;
  detail?: string | null;
}

export interface ReportReviewResponse {
  message: string;
  report: {
    id: number;
    review_id: number;
    reason: ReportReviewReason;
    detail: string | null;
    created_at: string;
  };
}

// 업체 리뷰 조회 파라미터
export interface GetCompanyReviewsParams {
  companyId: number; // 필수, path parameter
  skip?: number;
  limit?: number;
  with_photos?: boolean;
  my_country_only?: boolean;
  country?: string;
  tag?: string;
}

// 가리뷰 조회 파라미터
export interface GetGuestCompanyReviewsParams {
  companyId: number; // 필수, path parameter
  skip?: number;
  limit?: number;
  with_photos?: boolean;
  my_country_only?: boolean;
  country?: string;
  tags?: string;
}

// 업체 리뷰 조회 응답
export interface GetCompanyReviewsResponse {
  reviews: CompanyReviewItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// 업체 리뷰 아이템
export interface CompanyReviewItem {
  review_id: number;
  company_id: number;
  user_id: number;
  doctor_id?: number;
  doctor_name?: string;
  title?: string;
  content?: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  keywords?: keyword[];
  images?: string[];
  keyword_count?: number;
  image_count?: number;
}

// 가리뷰 조회 응답
export interface GetGuestCompanyReviewsResponse {
  total: number;
  reviews: GuestCompanyReviewItem[];
}

// 가리뷰 아이템
export interface GuestCompanyReviewItem {
  id: number;
  review_code: string;
  program_id: number;
  company_id: number;
  company_name: string;
  company_primary_image_url: string;
  customer_country: string;
  content: string;
  tags: string[];
  created_at: string;
  primary_image_url: string;
  image_urls: string[] | null;
  reviewer_username: string;
  reviewer_profile_image_url: string | null;
  visit_date: string;
  program_name: string;
  program_price: number;
  duration_minutes: number;
  is_first_visit: boolean | null;
  is_guest: boolean;
}
