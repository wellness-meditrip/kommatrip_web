import type { CompanyDetail } from '@/models';
import type { ProgramDetail } from '@/models/program';
import type { JsonLd } from '../meta.types';
import {
  buildPostalAddress,
  buildSchemaId,
  getSchemaContext,
  normalizeSchemaImages,
  normalizeSchemaString,
  toAbsoluteSchemaUrl,
} from './shared';

interface CreateProgramSchemaParams {
  program: ProgramDetail;
  path: string;
  company?: Pick<CompanyDetail, 'name' | 'address' | 'phone'> | null;
  companyPath?: string;
}

const resolveOfferAvailability = (program: ProgramDetail) => {
  if (program.is_active && normalizeSchemaString(program.status)?.toLowerCase() === 'active') {
    return 'https://schema.org/InStock';
  }

  if (!program.is_active) {
    return 'https://schema.org/OutOfStock';
  }

  return 'https://schema.org/LimitedAvailability';
};

const buildOffer = ({ program, path }: Pick<CreateProgramSchemaParams, 'program' | 'path'>) => {
  const url = toAbsoluteSchemaUrl(path);
  const krwPrice = program.price_info?.krw;
  const usdPrice = program.price_info?.usd;

  if (typeof krwPrice === 'number' && krwPrice > 0) {
    return {
      '@type': 'Offer',
      '@id': buildSchemaId(path, 'offer') ?? undefined,
      url,
      price: krwPrice,
      priceCurrency: 'KRW',
      availability: resolveOfferAvailability(program),
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: krwPrice,
        priceCurrency: 'KRW',
      },
      validFrom: normalizeSchemaString(program.created_at),
    };
  }

  if (typeof usdPrice === 'number' && usdPrice > 0) {
    return {
      '@type': 'Offer',
      '@id': buildSchemaId(path, 'offer') ?? undefined,
      url,
      price: usdPrice,
      priceCurrency: 'USD',
      availability: resolveOfferAvailability(program),
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: usdPrice,
        priceCurrency: 'USD',
      },
      validFrom: normalizeSchemaString(program.created_at),
    };
  }

  return undefined;
};

export const createProgramSchema = ({
  program,
  path,
  company,
  companyPath,
}: CreateProgramSchemaParams): JsonLd => {
  const url = toAbsoluteSchemaUrl(path);
  const images = normalizeSchemaImages([program.primary_image_url, ...(program.image_urls ?? [])]);
  const companyUrl = toAbsoluteSchemaUrl(companyPath);
  const offer = buildOffer({ program, path });
  const provider =
    company &&
    ({
      '@type': 'LocalBusiness',
      '@id': (companyPath ? buildSchemaId(companyPath, 'localbusiness') : undefined) ?? companyUrl,
      name: normalizeSchemaString(company.name),
      url: companyUrl,
      address: buildPostalAddress(company.address),
      telephone: normalizeSchemaString(company.phone),
    } as const);

  return {
    '@context': getSchemaContext(),
    '@type': 'Service',
    '@id': buildSchemaId(path, 'service') ?? url,
    name: normalizeSchemaString(program.name),
    description: normalizeSchemaString(program.description),
    url,
    image: images,
    provider,
    offers: offer
      ? {
          ...offer,
          seller: provider,
        }
      : undefined,
    duration:
      typeof program.duration_minutes === 'number' && program.duration_minutes > 0
        ? `PT${program.duration_minutes}M`
        : undefined,
    termsOfService: normalizeSchemaString(program.booking_information),
    keywords: program.process?.length ? program.process.join(', ') : undefined,
  };
};
