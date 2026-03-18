import type {
  AdminBusinessDay,
  AdminCompanyDetail,
  AdminCompanyFieldErrors,
  AdminCompanyFormValues,
  AdminCompanyImagesState,
  AdminCompanyReadonlyMeta,
} from '@/models';

export const ADMIN_BUSINESS_DAY_OPTIONS: Array<{ value: AdminBusinessDay; label: string }> = [
  { value: 'Mon', label: '월' },
  { value: 'Tue', label: '화' },
  { value: 'Wed', label: '수' },
  { value: 'Thu', label: '목' },
  { value: 'Fri', label: '금' },
  { value: 'Sat', label: '토' },
  { value: 'Sun', label: '일' },
];

export const MAX_ADMIN_COMPANY_IMAGES = 5;

const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const URL_FIELDS: Array<
  keyof Pick<
    AdminCompanyFormValues,
    'website_url' | 'instagram_url' | 'whats_app_url' | 'kakao_url'
  >
> = ['website_url', 'instagram_url', 'whats_app_url', 'kakao_url'];

const URL_FORMAT_VALIDATION_FIELDS: Array<
  keyof Pick<AdminCompanyFormValues, 'website_url' | 'kakao_url'>
> = ['website_url', 'kakao_url'];

const STRING_FIELDS: Array<
  keyof Pick<
    AdminCompanyFormValues,
    | 'name'
    | 'simpleplace'
    | 'address'
    | 'phone'
    | 'description'
    | 'booking_information'
    | 'refund_regulation'
    | 'badge'
    | 'highlights'
    | 'getting_here'
    | 'website_url'
    | 'instagram_url'
    | 'whats_app_url'
    | 'kakao_url'
  >
> = [
  'name',
  'simpleplace',
  'address',
  'phone',
  'description',
  'booking_information',
  'refund_regulation',
  'badge',
  'highlights',
  'getting_here',
  'website_url',
  'instagram_url',
  'whats_app_url',
  'kakao_url',
];

const TIME_FIELDS: Array<
  keyof Pick<
    AdminCompanyFormValues,
    'weekday_open_time' | 'weekday_close_time' | 'weekend_open_time' | 'weekend_close_time'
  >
> = ['weekday_open_time', 'weekday_close_time', 'weekend_open_time', 'weekend_close_time'];

const ARRAY_FIELDS: Array<
  keyof Pick<AdminCompanyFormValues, 'tags' | 'business_days' | 'facilities'>
> = ['tags', 'business_days', 'facilities'];

export const createEmptyAdminCompanyFormValues = (): AdminCompanyFormValues => ({
  name: '',
  simpleplace: '',
  address: '',
  phone: '',
  description: '',
  booking_information: '',
  refund_regulation: '',
  badge: '',
  highlights: '',
  getting_here: '',
  latitude: '',
  longitude: '',
  tags: [],
  business_days: [],
  facilities: [],
  weekday_open_time: '',
  weekday_close_time: '',
  weekend_open_time: '',
  weekend_close_time: '',
  website_url: '',
  instagram_url: '',
  whats_app_url: '',
  kakao_url: '',
  is_exclusive: false,
});

export const createEmptyAdminCompanyImagesState = (): AdminCompanyImagesState => ({
  existing_primary_image_url: null,
  existing_image_urls: [],
  new_files: [],
  replace_mode: false,
});

const normalizeArray = <T extends string>(value: T[] | null | undefined): T[] => value ?? [];

export const decodeAdminPreviewText = (value: string) => {
  return value
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
};

export const mapAdminCompanyDetailToFormValues = (
  company: AdminCompanyDetail
): {
  formValues: AdminCompanyFormValues;
  meta: AdminCompanyReadonlyMeta;
  images: AdminCompanyImagesState;
} => {
  return {
    formValues: {
      name: company.name ?? '',
      simpleplace: company.simpleplace ?? '',
      address: company.address ?? '',
      phone: company.phone ?? '',
      description: company.description ?? '',
      booking_information: company.booking_information ?? '',
      refund_regulation: company.refund_regulation ?? '',
      badge: company.badge ?? '',
      highlights: company.highlights ?? '',
      getting_here: company.getting_here ?? '',
      latitude: company.latitude == null ? '' : String(company.latitude),
      longitude: company.longitude == null ? '' : String(company.longitude),
      tags: normalizeArray(company.tags),
      business_days: normalizeArray(company.business_days),
      facilities: normalizeArray(company.facilities),
      weekday_open_time: company.weekday_open_time ?? '',
      weekday_close_time: company.weekday_close_time ?? '',
      weekend_open_time: company.weekend_open_time ?? '',
      weekend_close_time: company.weekend_close_time ?? '',
      website_url: company.website_url ?? '',
      instagram_url: company.instagram_url ?? '',
      whats_app_url: company.whats_app_url ?? '',
      kakao_url: company.kakao_url ?? '',
      is_exclusive: Boolean(company.is_exclusive),
    },
    meta: {
      id: company.id,
      company_code: company.company_code,
      status: company.status,
      is_verified: company.is_verified,
      views_count: company.views_count,
      rating_average: company.rating_average,
      created_at: company.created_at,
      updated_at: company.updated_at,
    },
    images: {
      existing_primary_image_url: company.primary_image_url ?? null,
      existing_image_urls: company.image_urls ?? [],
      new_files: [],
      replace_mode: false,
    },
  };
};

const isSameArray = (left: string[], right: string[]) =>
  JSON.stringify(left) === JSON.stringify(right);

export const hasAdminCompanyFormChanges = (
  currentValues: AdminCompanyFormValues,
  originalValues: AdminCompanyFormValues
) => {
  for (const field of STRING_FIELDS) {
    if (currentValues[field] !== originalValues[field]) return true;
  }

  if (currentValues.latitude !== originalValues.latitude) return true;
  if (currentValues.longitude !== originalValues.longitude) return true;
  if (currentValues.is_exclusive !== originalValues.is_exclusive) return true;

  for (const field of TIME_FIELDS) {
    if (currentValues[field] !== originalValues[field]) return true;
  }

  for (const field of ARRAY_FIELDS) {
    if (!isSameArray(currentValues[field], originalValues[field])) return true;
  }

  return false;
};

const hasValue = (value: string) => value.trim().length > 0;

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const validateAdminCompanyForm = (params: {
  mode: 'create' | 'edit';
  values: AdminCompanyFormValues;
  originalValues?: AdminCompanyFormValues | null;
  imageState: AdminCompanyImagesState;
}): AdminCompanyFieldErrors => {
  const { mode, values, originalValues, imageState } = params;
  const errors: AdminCompanyFieldErrors = {};

  if (values.name.trim().length < 2) errors.name = '업체명은 2자 이상 입력해주세요.';
  if (values.address.trim().length < 5) errors.address = '주소는 5자 이상 입력해주세요.';
  if (values.phone.trim().length < 10) errors.phone = '전화번호는 10자 이상 입력해주세요.';
  if (values.description.length > 2000) errors.description = '소개는 2000자 이하로 입력해주세요.';
  if (values.badge.length > 1000) errors.badge = '배지는 1000자 이하로 입력해주세요.';

  for (const field of URL_FIELDS) {
    const currentValue = values[field].trim();
    if (currentValue.length > 500) {
      errors[field] = 'URL은 500자 이하로 입력해주세요.';
      continue;
    }
    if (
      currentValue &&
      URL_FORMAT_VALIDATION_FIELDS.includes(field as 'website_url' | 'kakao_url') &&
      !isValidUrl(currentValue)
    ) {
      errors[field] = '올바른 URL 형식으로 입력해주세요.';
    }
  }

  for (const field of TIME_FIELDS) {
    const currentValue = values[field].trim();
    if (currentValue && !TIME_PATTERN.test(currentValue)) {
      errors[field] = '시간은 HH:MM 형식으로 입력해주세요.';
    }
  }

  if (values.latitude && Number.isNaN(Number(values.latitude))) {
    errors.latitude = '위도는 숫자만 입력해주세요.';
  }
  if (values.longitude && Number.isNaN(Number(values.longitude))) {
    errors.longitude = '경도는 숫자만 입력해주세요.';
  }

  if (originalValues) {
    if (originalValues.latitude && !values.latitude) {
      errors.latitude = '기존 위도값은 현재 비울 수 없습니다.';
    }
    if (originalValues.longitude && !values.longitude) {
      errors.longitude = '기존 경도값은 현재 비울 수 없습니다.';
    }

    for (const field of TIME_FIELDS) {
      if (originalValues[field] && !values[field]) {
        errors[field] = '기존 시간값은 현재 비울 수 없습니다.';
      }
    }
  }

  if (imageState.new_files.some((file) => !file.type.startsWith('image/'))) {
    errors.images = '이미지 파일만 업로드할 수 있습니다.';
  }

  if (imageState.new_files.length > MAX_ADMIN_COMPANY_IMAGES) {
    errors.images = `이미지는 최대 ${MAX_ADMIN_COMPANY_IMAGES}장까지 업로드할 수 있습니다.`;
  }

  if (mode === 'edit' && imageState.replace_mode && imageState.new_files.length === 0) {
    errors.images = '이미지 교체 시 새 이미지를 1장 이상 선택해주세요.';
  }

  return errors;
};

export const getFirstAdminCompanyError = (errors: AdminCompanyFieldErrors) => {
  return Object.values(errors).find((value) => typeof value === 'string' && hasValue(value));
};

const appendStringField = (formData: FormData, key: string, value: string) => {
  formData.append(key, value);
};

const appendJsonArrayField = (formData: FormData, key: string, value: string[]) => {
  formData.append(key, JSON.stringify(value));
};

export const buildAdminCompanyCreateFormData = (
  values: AdminCompanyFormValues,
  imageState: AdminCompanyImagesState
) => {
  const formData = new FormData();

  appendStringField(formData, 'name', values.name.trim());
  if (hasValue(values.simpleplace))
    appendStringField(formData, 'simpleplace', values.simpleplace.trim());
  appendStringField(formData, 'address', values.address.trim());
  appendStringField(formData, 'phone', values.phone.trim());
  appendStringField(formData, 'is_exclusive', String(values.is_exclusive));

  if (hasValue(values.description)) appendStringField(formData, 'description', values.description);
  if (hasValue(values.booking_information))
    appendStringField(formData, 'booking_information', values.booking_information);
  if (hasValue(values.refund_regulation))
    appendStringField(formData, 'refund_regulation', values.refund_regulation);
  if (hasValue(values.badge)) appendStringField(formData, 'badge', values.badge);
  if (hasValue(values.highlights)) appendStringField(formData, 'highlights', values.highlights);
  if (hasValue(values.getting_here))
    appendStringField(formData, 'getting_here', values.getting_here);

  appendJsonArrayField(formData, 'tags', values.tags);
  appendJsonArrayField(formData, 'business_days', values.business_days);
  appendJsonArrayField(formData, 'facilities', values.facilities);

  if (hasValue(values.latitude)) appendStringField(formData, 'latitude', values.latitude);
  if (hasValue(values.longitude)) appendStringField(formData, 'longitude', values.longitude);

  for (const field of TIME_FIELDS) {
    if (hasValue(values[field])) appendStringField(formData, field, values[field]);
  }

  for (const field of URL_FIELDS) {
    if (hasValue(values[field])) appendStringField(formData, field, values[field]);
  }

  for (const file of imageState.new_files) {
    formData.append('image_files', file);
  }

  return formData;
};

export const buildAdminCompanyUpdateFormData = (
  values: AdminCompanyFormValues,
  originalValues: AdminCompanyFormValues
) => {
  const formData = new FormData();
  let changedCount = 0;

  for (const field of STRING_FIELDS) {
    if (values[field] === originalValues[field]) continue;
    appendStringField(formData, field, values[field]);
    changedCount += 1;
  }

  if (values.is_exclusive !== originalValues.is_exclusive) {
    appendStringField(formData, 'is_exclusive', String(values.is_exclusive));
    changedCount += 1;
  }

  if (values.latitude !== originalValues.latitude && hasValue(values.latitude)) {
    appendStringField(formData, 'latitude', values.latitude);
    changedCount += 1;
  }

  if (values.longitude !== originalValues.longitude && hasValue(values.longitude)) {
    appendStringField(formData, 'longitude', values.longitude);
    changedCount += 1;
  }

  for (const field of TIME_FIELDS) {
    if (values[field] === originalValues[field]) continue;
    if (hasValue(values[field])) {
      appendStringField(formData, field, values[field]);
      changedCount += 1;
    }
  }

  for (const field of ARRAY_FIELDS) {
    if (isSameArray(values[field], originalValues[field])) continue;
    appendJsonArrayField(formData, field, values[field]);
    changedCount += 1;
  }

  return {
    formData,
    changedCount,
  };
};

export const buildAdminCompanyImagesFormData = (files: File[]) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('image_files', file);
  }
  return formData;
};
