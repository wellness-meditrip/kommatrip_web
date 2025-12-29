export interface AvailabilityOption {
  date: string;
  times: string[];
}

export type LanguagePreference = 'korean' | 'english' | 'chinese' | 'japanese';

export interface PostCreateReservationRequest {
  program_id: number;
  preferred_contact: string;
  language_preference: LanguagePreference;
  availability_options: AvailabilityOption[];
  inquiries: string;
  contact_line: string;
  contact_whatsapp: string;
  contact_kakao: string;
  contact_phone: string;
}

export interface PostCreateReservationResponse {
  reservation_id?: number;
  status?: string;
  created_at?: string;
  message?: string;
}

export type ReservationStatus = 'request' | 'confirmed' | 'canceled' | 'completed' | string;

export interface ReservationListItem {
  id: number;
  status: ReservationStatus;
  company_id?: number;
  program_id?: number;
  program_name?: string;
  company_name?: string;
  company_address?: string;
  program_image_url?: string;
  company_image_url?: string;
  company_primary_image_url?: string;
  visit_date?: string;
  visit_time?: string;
  date?: string;
  time?: string;
  has_review?: boolean;
  review_written?: boolean;
}

export interface GetReservationsParams {
  skip?: number;
  limit?: number;
  status?: string;
}

export interface GetReservationsResponse {
  reservations: ReservationListItem[];
  total: number;
  skip: number;
  limit: number;
  status_filter?: string;
}

export interface ReservationProgramInfo {
  id?: number;
  company_code?: string;
  name?: string;
  description?: string;
  price?: number;
  guidelines?: string;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  duration_minutes?: number;
  process?: string[];
  views_count?: number;
  reservations_count?: number;
  created_by_user_id?: number;
  primary_image_url?: string;
  image_urls?: string[];
  booking_information?: string;
  refund_regulation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReservationDetail {
  id: number;
  reservation_code?: string;
  user_id?: number;
  user_name?: string;
  program_id?: number;
  company_id?: number;
  company_address?: string;
  program_info?: ReservationProgramInfo;
  customer_email?: string;
  preferred_contact?: string;
  language_preference?: string;
  contact_line?: string | null;
  contact_whatsapp?: string | null;
  contact_kakao?: string | null;
  contact_phone?: string | null;
  inquiries?: string | null;
  visit_date?: string | null;
  availability_options?: AvailabilityOption[];
  status?: string;
  admin_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
}

export interface GetReservationDetailResponse {
  reservation: ReservationDetail;
}

export interface DeleteReservationRequest {
  reservationId: number | string;
  reason?: string | null;
}

export interface DeleteReservationResponse {
  message: string;
  reservation: {
    id: number;
    reservation_code?: string;
    program_id?: number;
    status?: ReservationStatus;
    visit_date?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
  };
}
