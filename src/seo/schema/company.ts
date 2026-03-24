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

const HEALTH_AND_BEAUTY_KEYWORDS = [
  'spa',
  'therapy',
  'facial',
  'beauty',
  'head spa',
  'head-spa',
  'wellness',
  '스파',
  '테라피',
  '헤드스파',
  '페이셜',
  '뷰티',
  '웰니스',
] as const;

const MEDICAL_KEYWORDS = [
  'medical',
  'medicine',
  'clinic',
  'hospital',
  'traditional medicine',
  'medical beauty',
  '한의',
  '병원',
  '의원',
  '메디컬',
  '의료',
  '한방',
] as const;

const resolveCompanySchemaType = (company: CompanyDetail) => {
  const sources = [company.name, ...(company.tags ?? [])]
    .map((value) => normalizeSchemaString(value)?.toLowerCase())
    .filter((value): value is string => Boolean(value));

  if (sources.some((source) => MEDICAL_KEYWORDS.some((keyword) => source.includes(keyword)))) {
    return 'MedicalBusiness';
  }

  if (
    sources.some((source) => HEALTH_AND_BEAUTY_KEYWORDS.some((keyword) => source.includes(keyword)))
  ) {
    return 'HealthAndBeautyBusiness';
  }

  return 'LocalBusiness';
};

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
    '@type': resolveCompanySchemaType(company),
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
    hasOfferCatalog:
      company.tags?.length > 0
        ? {
            '@type': 'OfferCatalog',
            name: `${company.name} services`,
            itemListElement: company.tags
              .map((tag) => normalizeSchemaString(tag))
              .filter((tag): tag is string => Boolean(tag))
              .map((tag) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: tag,
                },
              })),
          }
        : undefined,
    amenityFeature: amenityFeature.length > 0 ? amenityFeature : undefined,
    keywords: company.tags?.length ? company.tags.join(', ') : undefined,
  };
};
