import type { JsonLd } from '../meta.types';
import {
  buildSameAs,
  buildSchemaId,
  getSchemaContext,
  normalizeSchemaImages,
  normalizeSchemaString,
  toAbsoluteSchemaUrl,
} from './shared';

interface CreateWebSiteSchemaParams {
  path: string;
  name: string;
  description?: string;
  locale: string;
}

interface CreateOrganizationSchemaParams {
  path: string;
  name: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}

const getOrganizationSameAs = () =>
  buildSameAs([
    process.env.NEXT_PUBLIC_SITE_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_SITE_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_SITE_YOUTUBE_URL,
    process.env.NEXT_PUBLIC_SITE_X_URL,
    process.env.NEXT_PUBLIC_SITE_KAKAO_URL,
  ]);

export const createWebSiteSchema = ({
  path,
  name,
  description,
  locale,
}: CreateWebSiteSchemaParams): JsonLd => {
  const url = toAbsoluteSchemaUrl(path);

  return {
    '@context': getSchemaContext(),
    '@type': 'WebSite',
    '@id': buildSchemaId(path, 'website') ?? url,
    url,
    name: normalizeSchemaString(name),
    description: normalizeSchemaString(description),
    inLanguage: normalizeSchemaString(locale),
  };
};

export const createOrganizationSchema = ({
  path,
  name,
  description,
  image,
  sameAs,
}: CreateOrganizationSchemaParams): JsonLd => {
  const url = toAbsoluteSchemaUrl(path);
  const images = normalizeSchemaImages([image]);
  const resolvedSameAs = sameAs && sameAs.length > 0 ? sameAs : getOrganizationSameAs();

  return {
    '@context': getSchemaContext(),
    '@type': 'Organization',
    '@id': buildSchemaId(path, 'organization') ?? url,
    url,
    name: normalizeSchemaString(name),
    description: normalizeSchemaString(description),
    sameAs: resolvedSameAs,
    logo: images?.[0],
    image: images,
  };
};
