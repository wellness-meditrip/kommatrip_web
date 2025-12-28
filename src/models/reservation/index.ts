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
