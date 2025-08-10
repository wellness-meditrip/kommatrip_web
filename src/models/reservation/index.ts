export interface PostCreateReservationRequest {
  hospital_id: number;
  doctor_id: number;
  symptoms: string;
  current_medications: string;
  reservation_date: string;
  reservation_time: string;
  contact_email: string;
  contact_phone: string;
  interpreter_language: string;
  additional_notes: string;
  user_id: number;
  images: string[];
}

export interface PostCreateReservationResponse {
  reservation_id: number;
  status: string;
  created_at: string;
  message: string;
}
