export interface ProgramCompanyParams {
  company_code: number;
  skip: number;
  limit: number;
  include_drafts: boolean;
}

export interface GetProgramCompanyResponseParams {
  programs: Program[];
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
