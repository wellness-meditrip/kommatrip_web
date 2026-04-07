export const COUNTRY_OPTIONS = [
  { code: 'US', label: 'USA' },
  { code: 'JP', label: 'Japan' },
  { code: 'CN', label: 'China' },
  { code: 'KR', label: 'Korea' },
  // EU is intentionally treated as a regional code in this product.
  { code: 'EU', label: 'Europe' },
  { code: 'SG', label: 'Singapore' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'ETC', label: 'ETC' },
] as const;

export type SupportedCountryCode = (typeof COUNTRY_OPTIONS)[number]['code'];

const SUPPORTED_COUNTRY_CODE_SET = new Set<SupportedCountryCode>(
  COUNTRY_OPTIONS.map((option) => option.code)
);

const COUNTRY_CODE_ALIASES: Record<string, SupportedCountryCode> = {
  us: 'US',
  usa: 'US',
  'united states': 'US',
  unitedstates: 'US',
  jp: 'JP',
  japan: 'JP',
  cn: 'CN',
  china: 'CN',
  kr: 'KR',
  korea: 'KR',
  'south korea': 'KR',
  southkorea: 'KR',
  eu: 'EU',
  europe: 'EU',
  sg: 'SG',
  singapore: 'SG',
  my: 'MY',
  malaysia: 'MY',
  id: 'ID',
  indonesia: 'ID',
  etc: 'ETC',
};

export const isSupportedCountryCode = (value: string): value is SupportedCountryCode =>
  SUPPORTED_COUNTRY_CODE_SET.has(value as SupportedCountryCode);

export const normalizeCountryCode = (value?: string | null): string => {
  if (!value) return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  if (isSupportedCountryCode(upper)) {
    return upper;
  }

  const normalized = trimmed.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const collapsed = normalized.replace(/\s+/g, '');

  return COUNTRY_CODE_ALIASES[normalized] ?? COUNTRY_CODE_ALIASES[collapsed] ?? 'ETC';
};
