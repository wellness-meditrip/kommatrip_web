import type { JsonLd } from '../meta.types';
import {
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
}

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
}: CreateOrganizationSchemaParams): JsonLd => {
  const url = toAbsoluteSchemaUrl(path);
  const images = normalizeSchemaImages([image]);

  return {
    '@context': getSchemaContext(),
    '@type': 'Organization',
    '@id': buildSchemaId(path, 'organization') ?? url,
    url,
    name: normalizeSchemaString(name),
    description: normalizeSchemaString(description),
    logo: images?.[0],
    image: images,
  };
};
