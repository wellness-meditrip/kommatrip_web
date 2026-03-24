import type { JsonLd } from '../meta.types';
import { toAbsoluteUrl } from '../meta.utils';

const SCHEMA_CONTEXT = 'https://schema.org';
const WEEKDAY_OPEN_DAYS = [
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday',
] as const;
const WEEKEND_OPEN_DAYS = ['https://schema.org/Saturday', 'https://schema.org/Sunday'] as const;

export const getSchemaContext = () => SCHEMA_CONTEXT;

export const normalizeSchemaString = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

export const toAbsoluteSchemaUrl = (path?: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
  return toAbsoluteUrl(siteUrl, path);
};

export const buildSchemaId = (path: string, fragment: string) => {
  const url = toAbsoluteSchemaUrl(path);
  return url ? `${url}#${fragment}` : undefined;
};

export const normalizeSchemaImages = (values: Array<string | null | undefined>) => {
  const images = Array.from(
    new Set(
      values
        .map((value) => normalizeSchemaString(value))
        .map((value) => toAbsoluteSchemaUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  );

  return images.length > 0 ? images : undefined;
};

export const buildSameAs = (values: Array<string | null | undefined>) => {
  const sameAs = Array.from(
    new Set(
      values
        .map((value) => normalizeSchemaString(value))
        .map((value) => toAbsoluteSchemaUrl(value))
        .filter((value): value is string => Boolean(value))
    )
  );

  return sameAs.length > 0 ? sameAs : undefined;
};

export const buildPostalAddress = (address?: string | null): JsonLd | undefined => {
  const streetAddress = normalizeSchemaString(address);

  if (!streetAddress) {
    return undefined;
  }

  return {
    '@type': 'PostalAddress',
    streetAddress,
  };
};

export const buildGeoCoordinates = (
  latitude?: number | null,
  longitude?: number | null
): JsonLd | undefined => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return undefined;
  }

  if (latitude === 0 && longitude === 0) {
    return undefined;
  }

  return {
    '@type': 'GeoCoordinates',
    latitude,
    longitude,
  };
};

const buildOpeningHoursItem = (
  days: readonly string[],
  opens?: string | null,
  closes?: string | null
): JsonLd | undefined => {
  const normalizedOpens = normalizeSchemaString(opens);
  const normalizedCloses = normalizeSchemaString(closes);

  if (!normalizedOpens || !normalizedCloses) {
    return undefined;
  }

  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [...days],
    opens: normalizedOpens,
    closes: normalizedCloses,
  };
};

export const buildOpeningHoursSpecification = ({
  weekdayOpenTime,
  weekdayCloseTime,
  weekendOpenTime,
  weekendCloseTime,
}: {
  weekdayOpenTime?: string | null;
  weekdayCloseTime?: string | null;
  weekendOpenTime?: string | null;
  weekendCloseTime?: string | null;
}) => {
  const items = [
    buildOpeningHoursItem(WEEKDAY_OPEN_DAYS, weekdayOpenTime, weekdayCloseTime),
    buildOpeningHoursItem(WEEKEND_OPEN_DAYS, weekendOpenTime, weekendCloseTime),
  ].filter((item): item is JsonLd => Boolean(item));

  return items.length > 0 ? items : undefined;
};
