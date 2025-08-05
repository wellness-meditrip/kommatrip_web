export interface GetClinicRequestParams {
  page?: number;
  size?: number;
  keyword?: string;
  city?: string;
  department?: string;
  parking_required?: boolean;
}
export interface GetClinicClinicIdRequestParams {
  hospitalId: number;
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
