import type {
  AdminProgramDetail,
  AdminProgramFieldErrors,
  AdminProgramFormValues,
  AdminProgramImagesState,
  AdminProgramReadonlyMeta,
  AdminProgramStatus,
} from '@/models';

export const ADMIN_PROGRAM_STATUS_OPTIONS: Array<{ value: AdminProgramStatus; label: string }> = [
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
  { value: 'draft', label: '초안' },
  { value: 'suspended', label: '중지' },
];

export const MAX_ADMIN_PROGRAM_IMAGES = 5;

const STRING_FIELDS: Array<
  keyof Pick<AdminProgramFormValues, 'name' | 'description' | 'guidelines'>
> = ['name', 'description', 'guidelines'];

export const createEmptyAdminProgramFormValues = (): AdminProgramFormValues => ({
  name: '',
  description: '',
  price: '',
  guidelines: '',
  duration_minutes: '',
  process: [],
  status: 'draft',
});

export const createEmptyAdminProgramImagesState = (): AdminProgramImagesState => ({
  existing_primary_image_url: null,
  existing_image_urls: [],
  new_files: [],
  replace_mode: false,
});

export const mapAdminProgramDetailToFormValues = (
  program: AdminProgramDetail
): {
  formValues: AdminProgramFormValues;
  meta: AdminProgramReadonlyMeta;
  images: AdminProgramImagesState;
} => {
  return {
    formValues: {
      name: program.name ?? '',
      description: program.description ?? '',
      price: program.price_info?.krw == null ? '' : String(program.price_info.krw),
      guidelines: program.guidelines ?? '',
      duration_minutes: program.duration_minutes == null ? '' : String(program.duration_minutes),
      process: program.process ?? [],
      status: program.status,
    },
    meta: {
      id: program.id,
      company_code: program.company_code,
      status: program.status,
      is_active: program.is_active,
      is_featured: program.is_featured,
      views_count: program.views_count,
      reservations_count: program.reservations_count,
      price_krw: program.price_info?.krw == null ? '-' : String(program.price_info.krw),
      price_usd: program.price_info?.usd == null ? '-' : String(program.price_info.usd),
      created_at: program.created_at,
      updated_at: program.updated_at,
    },
    images: {
      existing_primary_image_url: program.primary_image_url ?? null,
      existing_image_urls: program.image_urls ?? [],
      new_files: [],
      replace_mode: false,
    },
  };
};

const hasValue = (value: string) => value.trim().length > 0;
const isSameArray = (left: string[], right: string[]) =>
  JSON.stringify(left) === JSON.stringify(right);

export const hasAdminProgramFormChanges = (
  currentValues: AdminProgramFormValues,
  originalValues: AdminProgramFormValues
) => {
  for (const field of STRING_FIELDS) {
    if (currentValues[field] !== originalValues[field]) return true;
  }

  if (currentValues.price !== originalValues.price) return true;
  if (currentValues.duration_minutes !== originalValues.duration_minutes) return true;
  if (currentValues.status !== originalValues.status) return true;
  if (!isSameArray(currentValues.process, originalValues.process)) return true;

  return false;
};

export const validateAdminProgramForm = (params: {
  mode: 'create' | 'edit';
  values: AdminProgramFormValues;
  imageState: AdminProgramImagesState;
}): AdminProgramFieldErrors => {
  const { mode, values, imageState } = params;
  const errors: AdminProgramFieldErrors = {};

  if (values.name.trim().length < 1) errors.name = '프로그램명을 입력해주세요.';
  if (values.description.trim().length < 10)
    errors.description = '프로그램 설명은 10자 이상 입력해주세요.';
  if (!hasValue(values.price) || Number.isNaN(Number(values.price)) || Number(values.price) <= 0) {
    errors.price = '가격은 0보다 큰 숫자로 입력해주세요.';
  }
  if (
    values.duration_minutes &&
    (Number.isNaN(Number(values.duration_minutes)) || Number(values.duration_minutes) <= 0)
  ) {
    errors.duration_minutes = '소요시간은 0보다 큰 숫자로 입력해주세요.';
  }
  if (imageState.new_files.some((file) => !file.type.startsWith('image/'))) {
    errors.images = '이미지 파일만 업로드할 수 있습니다.';
  }
  if (imageState.new_files.length > MAX_ADMIN_PROGRAM_IMAGES) {
    errors.images = `이미지는 최대 ${MAX_ADMIN_PROGRAM_IMAGES}장까지 업로드할 수 있습니다.`;
  }
  if (mode === 'create' && imageState.new_files.length === 0) {
    errors.images = '프로그램 등록 시 이미지를 1장 이상 선택해주세요.';
  }
  if (mode === 'edit' && imageState.replace_mode && imageState.new_files.length === 0) {
    errors.images = '이미지 교체 시 새 이미지를 1장 이상 선택해주세요.';
  }

  return errors;
};

export const getFirstAdminProgramError = (errors: AdminProgramFieldErrors) => {
  return Object.values(errors).find(
    (value) => typeof value === 'string' && value.trim().length > 0
  );
};

export const buildAdminProgramCreateFormData = (
  values: AdminProgramFormValues,
  params: {
    companyCode: string;
    imageState: AdminProgramImagesState;
  }
) => {
  const formData = new FormData();
  formData.append('name', values.name.trim());
  formData.append('description', values.description.trim());
  formData.append('price', values.price.trim());
  formData.append('company_code', params.companyCode);
  if (hasValue(values.guidelines)) formData.append('guidelines', values.guidelines);
  if (hasValue(values.duration_minutes))
    formData.append('duration_minutes', values.duration_minutes.trim());
  if (values.process.length > 0) formData.append('process', JSON.stringify(values.process));
  for (const file of params.imageState.new_files) {
    formData.append('image_files', file);
  }
  return formData;
};

export const buildAdminProgramUpdatePayload = (
  values: AdminProgramFormValues,
  originalValues: AdminProgramFormValues
) => {
  const payload: Record<string, unknown> = {};
  let changedCount = 0;

  for (const field of STRING_FIELDS) {
    if (values[field] === originalValues[field]) continue;
    payload[field] = values[field];
    changedCount += 1;
  }

  if (values.price !== originalValues.price) {
    payload.price = Number(values.price);
    changedCount += 1;
  }

  if (values.duration_minutes !== originalValues.duration_minutes) {
    payload.duration_minutes = hasValue(values.duration_minutes)
      ? Number(values.duration_minutes)
      : null;
    changedCount += 1;
  }

  if (!isSameArray(values.process, originalValues.process)) {
    payload.process = values.process;
    changedCount += 1;
  }

  if (values.status !== originalValues.status) {
    payload.status = values.status;
    changedCount += 1;
  }

  return {
    payload,
    changedCount,
  };
};

export const buildAdminProgramImagesFormData = (files: File[]) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('image_files', file);
  }
  return formData;
};
