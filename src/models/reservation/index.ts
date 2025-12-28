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
  program_name?: string;
  company_name?: string;
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
