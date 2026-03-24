import type { CompanyDetail } from '@/models';
import type { JsonLd } from '../meta.types';
import {
  buildGeoCoordinates,
  buildOpeningHoursSpecification,
  buildPostalAddress,
  buildSameAs,
  buildSchemaId,
  getSchemaContext,
  normalizeSchemaImages,
  normalizeSchemaString,
  toAbsoluteSchemaUrl,
} from './shared';

interface CreateCompanySchemaParams {
  company: CompanyDetail;
  path: string;
}

export const createCompanySchema = ({ company, path }: CreateCompanySchemaParams): JsonLd => {
  const url = toAbsoluteSchemaUrl(path);
  const images = normalizeSchemaImages([company.primary_image_url, ...(company.image_urls ?? [])]);
  const sameAs = buildSameAs([
    company.website_url,
    company.instagram_url,
    company.whats_app_url,
    company.kakao_url,
  ]);
  const amenityFeature =
    company.facilities
      ?.map((facility) => normalizeSchemaString(facility))
      .filter((facility): facility is string => Boolean(facility))
      .map((facility) => ({
        '@type': 'LocationFeatureSpecification',
        name: facility,
        value: true,
      })) ?? [];

  return {
    '@context': getSchemaContext(),
    '@type': 'LocalBusiness',
    '@id': buildSchemaId(path, 'localbusiness') ?? url,
    name: normalizeSchemaString(company.name),
    description: normalizeSchemaString(company.description),
    url,
    image: images,
    address: buildPostalAddress(company.address),
    telephone: normalizeSchemaString(company.phone),
    geo: buildGeoCoordinates(company.latitude, company.longitude),
    sameAs,
    openingHoursSpecification: buildOpeningHoursSpecification({
      weekdayOpenTime: company.weekday_open_time,
      weekdayCloseTime: company.weekday_close_time,
      weekendOpenTime: company.weekend_open_time,
      weekendCloseTime: company.weekend_close_time,
    }),
    amenityFeature: amenityFeature.length > 0 ? amenityFeature : undefined,
    keywords: company.tags?.length ? company.tags.join(', ') : undefined,
  };
};
