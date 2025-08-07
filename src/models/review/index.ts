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
