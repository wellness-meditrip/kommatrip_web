import type { GuestCompanyReviewItem } from '../review';
import type { AvailabilityOption, ReservationDetail, ReservationListItem } from '../reservation';

export type AdminCompanyStatusFilter = 'active' | 'pending' | 'suspended';
export type AdminReservationListStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'completed'
  | 'no-show'
  | 'canceled';

export type AdminBusinessDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type AdminProgramStatus = 'active' | 'inactive' | 'draft' | 'suspended';

export interface AdminAuthUser {
  id: number;
  email: string;
  username: string;
  role: string;
}

export interface AdminAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer' | 'bearer';
}

export interface AdminLoginResponse {
  message: string;
  user: AdminAuthUser;
  tokens: AdminAuthTokens;
}

export interface AdminRegisterRequestBody {
  email: string;
  password: string;
  username: string;
  admin_secret_key: string;
}

export type AdminUserGenderFilter = 'male' | 'female' | 'noselect';

export interface AdminUsersParams {
  email?: string;
  user_name?: string;
  country?: string;
  gender?: AdminUserGenderFilter;
  age_group?: string;
  topic_interest?: string;
  phone?: string;
  marketing_consent?: boolean;
}

export interface AdminUserListItem {
  id: number;
  email: string;
  username: string;
  country: string | null;
  role: string;
  gender?: AdminUserGenderFilter | null;
  age_group?: string | null;
  topic_interest?: string[];
  phone?: string | null;
  marketing_consent: boolean;
  created_at?: string | null;
}

export interface AdminUsersResponse {
  count: number;
  users: AdminUserListItem[];
}

export interface AdminUserDeleteResponse {
  message: string;
}

export interface AdminCompanyDetail {
  id: number;
  company_code: string;
  name: string;
  simpleplace: string | null;
  address: string;
  phone: string;
  description: string | null;
  booking_information: string | null;
  refund_regulation: string | null;
  badge: string | null;
  highlights: string | null;
  getting_here: string | null;
  latitude: number | null;
  longitude: number | null;
  is_exclusive: boolean;
  tags: string[] | null;
  business_days: AdminBusinessDay[] | null;
  facilities: string[] | null;
  weekday_open_time: string | null;
  weekday_close_time: string | null;
  weekend_open_time: string | null;
  weekend_close_time: string | null;
  website_url: string | null;
  instagram_url: string | null;
  whats_app_url: string | null;
  kakao_url: string | null;
  status: string;
  is_verified: boolean;
  views_count: number;
  rating_average: string;
  primary_image_url: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string | null;
}

export interface AdminCompanyDetailResponse {
  company: AdminCompanyDetail;
}

export interface AdminCompanyListItem {
  id: number;
  name: string;
  address: string;
  simpleplace?: string | null;
  photos?: string[];
  tags: string[];
  is_exclusive?: boolean;
}

export interface AdminCompaniesResponse {
  companies: AdminCompanyListItem[];
  total: number;
}

export interface AdminCompanyFormValues {
  name: string;
  simpleplace: string;
  address: string;
  phone: string;
  description: string;
  booking_information: string;
  refund_regulation: string;
  badge: string;
  highlights: string;
  getting_here: string;
  latitude: string;
  longitude: string;
  tags: string[];
  business_days: AdminBusinessDay[];
  facilities: string[];
  weekday_open_time: string;
  weekday_close_time: string;
  weekend_open_time: string;
  weekend_close_time: string;
  website_url: string;
  instagram_url: string;
  whats_app_url: string;
  kakao_url: string;
  is_exclusive: boolean;
}

export interface AdminCompanyReadonlyMeta {
  id: number;
  company_code: string;
  status: string;
  is_verified: boolean;
  views_count: number;
  rating_average: string;
  created_at: string;
  updated_at: string | null;
}

export interface AdminCompanyImagesState {
  existing_primary_image_url: string | null;
  existing_image_urls: string[];
  new_files: File[];
  replace_mode: boolean;
}

export type AdminCompanyFieldErrors = Partial<
  Record<keyof AdminCompanyFormValues | 'tags' | 'facilities' | 'business_days' | 'images', string>
>;

export interface AdminProgramPriceInfo {
  krw: number;
  usd: number;
}

export interface AdminProgramListItem {
  id: number;
  name: string;
  price_info: AdminProgramPriceInfo;
  duration_minutes: number;
  status: AdminProgramStatus;
  process: string[];
  views_count: number;
  reservations_count: number;
  created_at: string;
  primary_image_url: string;
  image_urls: string[];
}

export interface AdminProgramsByCompanyResponse {
  company_id?: number;
  company_code: string;
  company_name?: string;
  programs: AdminProgramListItem[];
  total: number;
}

export interface AdminProgramDetail {
  id: number;
  company_code: string;
  name: string;
  description: string;
  price_info: AdminProgramPriceInfo;
  guidelines: string | null;
  status: AdminProgramStatus;
  is_active: boolean;
  is_featured: boolean;
  duration_minutes: number | null;
  process: string[] | null;
  views_count: number;
  reservations_count: number;
  created_by_user_id: number | null;
  primary_image_url: string | null;
  image_urls: string[];
  booking_information: string | null;
  refund_regulation: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AdminProgramDetailResponse {
  program: AdminProgramDetail;
}

export interface AdminProgramFormValues {
  name: string;
  description: string;
  price: string;
  guidelines: string;
  duration_minutes: string;
  process: string[];
  status: AdminProgramStatus;
}

export interface AdminProgramReadonlyMeta {
  id: number;
  company_code: string;
  status: AdminProgramStatus;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  reservations_count: number;
  price_krw: string;
  price_usd: string;
  created_at: string;
  updated_at: string | null;
}

export interface AdminProgramImagesState {
  existing_primary_image_url: string | null;
  existing_image_urls: string[];
  new_files: File[];
  replace_mode: boolean;
}

export type AdminProgramFieldErrors = Partial<
  Record<keyof AdminProgramFormValues | 'process' | 'images', string>
>;

export interface AdminProgramActionResponse {
  message: string;
  program?: AdminProgramDetail;
}

export interface AdminReservationListItem extends ReservationListItem {
  reservation_code?: string;
  customer_email?: string | null;
  customer_name?: string | null;
  currency?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminReservationsResponse {
  reservations: AdminReservationListItem[];
  total: number;
  skip: number;
  limit: number;
  status_filter?: string;
}

export type AdminReservationDetail = ReservationDetail;

export interface AdminReservationDetailResponse {
  reservation: AdminReservationDetail;
}

export interface AdminReservationUpdateRequest {
  status?: string;
  visit_date?: string | null;
  preferred_contact?: string;
  language_preference?: string;
  inquiries?: string;
  contact_line?: string;
  contact_whatsapp?: string;
  contact_kakao?: string;
  contact_phone?: string;
  cancellation_reason?: string;
  admin_notes?: string;
  availability_options?: AvailabilityOption[];
}

export interface AdminReservationActionResponse {
  message: string;
  reservation?: AdminReservationDetail;
}

export interface AdminReservationStatsResponse {
  total: number;
  counts: Partial<
    Record<'request' | 'confirmed' | 'rejected' | 'completed' | 'no_show' | 'canceled', number>
  >;
  gender_counts?: Record<string, number>;
  age_group_counts?: Record<string, number>;
  start_date?: string | null;
  end_date?: string | null;
}

export interface AdminCompanyReviewsResponse {
  total: number;
  reviews: GuestCompanyReviewItem[];
}
