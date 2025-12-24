export interface ProgramCompanyParams {
  company_code: number;
  skip: number;
  limit: number;
  include_drafts: boolean;
}

export interface GetProgramCompanyResponseParams {
  programs: Program[];
}

export interface ProgramCompanyListParams {
  company_id: number;
  skip?: number;
  limit?: number;
}

export interface ProgramCompanyListResponse {
  company_id: number;
  company_code: string;
  company_name: string;
  programs: ProgramListItem[];
  total: number;
}

export interface ProgramListItem {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  status: string;
  process: string[];
  views_count: number;
  reservations_count: number;
  created_at: string;
  primary_image_url: string;
  image_urls: string[];
}

export interface ProgramDetail {
  id: number;
  company_code: string;
  name: string;
  description: string;
  price: number;
  guidelines: string;
  status: string;
  is_active: boolean;
  is_featured: boolean;
  duration_minutes: number;
  process: string[];
  views_count: number;
  reservations_count: number;
  created_by_user_id: number;
  primary_image_url: string;
  image_urls: string[];
  booking_information: string;
  refund_regulation: string;
  created_at: string;
  updated_at: string;
}

export interface GetProgramDetailResponse {
  program: ProgramDetail;
}

export interface Program {
  id: number;
  name: string;
  image: string;
  tags: string[];
  description: string;
  time: string;
  price: number;
  duration: number;
  notice: string;
  process: string;
  created_at: string;
  updated_at: string;
}
