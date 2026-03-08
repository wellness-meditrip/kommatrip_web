export interface GetRecentCompanyResponse {
  id: number;
  name: string;
  simple_place: string;
  photos: string[];
  tags: string[];
  is_exclusive: boolean;
  viewed_at: string;
}

export interface GetRecommendedCompanyResponse {
  id: number;
  name: string;
  simpleplace?: string;
  simple_place?: string;
  photos: string[];
  tags: string[];
  is_exclusive: boolean;
}
export interface GetCompanyId {
  companyId: number;
}
export interface GetUserGroomerSearchResponse {
  page: number;
  size: number;
  totalElements: number;
  result: {
    partnerId: number;
    partnerName: string;
    partnerImage: string;
  }[];
}
export interface GetClinicResponse {
  hospitals: Hospital[];
  total: number;
  page: number;
  size: number;
}

export interface Hospital {
  hospital_name: string;
  address: string;
  contact: string;
  website: string;
  line: string;
  instagram: string;
  youtube: string;
  established_date: string;
  hospital_description: string;
  hospital_description_jp: string;
  hospital_description_en: string;
  hospital_address_jp: string;
  hospital_address_en: string;
  hospital_id: number;
  created_at: string;
  updated_at: string;
  hospital_details: HospitalDetail[];
}

export interface HospitalDetail {
  parking_available: boolean;
  operating_hours: OperatingHour[];
  images: HospitalImage[];
  departments: Department[];
  id: number;
  hospital_id: number;
  created_at: string;
  updated_at: string;
  parking_description: string;
  wifi_available: boolean;
  wifi_description: string;
  luggage_storage: boolean;
  luggage_storage_description: string;
  private_treatment: boolean;
  private_treatment_description: string;
  airport_pickup: boolean;
  airport_pickup_description: string;
  translation_service: boolean;
  translation_description: string;
}

export interface OperatingHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  lunch_start: string;
  lunch_end: string;
  is_closed: boolean;
  notes: string;
}

export interface HospitalImage {
  image_type: string;
  image_url: string;
  alt_text: string;
  is_main: boolean;
}

export interface Department {
  name: string;
  name_en: string;
  name_jp: string;
  description: string;
  is_available: boolean;
}

// 새로운 API response interfaces
export interface Company {
  id: number;
  name: string;
  address: string;
  photos?: string[];
  tags: string[];
  opening_time: string;
  closing_time: string;
  views_count: number;
  rating_average: string;
  is_verified: boolean;
  is_exclusive?: boolean;
}

export interface SearchParams {
  search_term: string;
  tags: string[] | null;
  location: string | null;
  skip: number;
  limit: number;
  date?: string;
  endDate?: string;
}

export interface GetCompanySearchResponseParams {
  data: {
    companies: Company[];
    total: number;
    search_params: SearchParams;
  };
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
  request: Record<string, unknown>;
}

// 업체 상세 조회 관련 interfaces
export interface CompanyDetail {
  id: number;
  company_code: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  booking_information: string;
  refund_regulation?: string;
  badge: string;
  highlights: string;
  getting_here: string;
  latitude: number;
  longitude: number;
  is_exclusive: boolean;
  tags: string[];
  business_days: string[];
  facilities: string[];
  weekday_open_time: string;
  weekday_close_time: string;
  weekend_open_time: string;
  weekend_close_time: string;
  website_url: string;
  instagram_url: string;
  whats_app_url: string;
  kakao_url: string;
  status: string;
  is_verified: boolean;
  views_count: number;
  rating_average: string;
  primary_image_url: string;
  image_urls: string[];
}

export interface GetCompanyDetailResponse {
  data: {
    company: CompanyDetail;
  };
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
  request: Record<string, unknown>;
}

export interface GetCompanyIdRequestParams {
  companyId: number;
}

export interface GetCompanyAllResponse {
  data: {
    companies: Company[];
    total: number;
  };
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
  request: Record<string, unknown>;
}
