import type { JsonLd } from '../../meta.types';
import { createOrganizationSchema, createWebSiteSchema } from '../site';

interface BuildHomeJsonLdParams {
  locale: string;
  path: string;
  siteName: string;
  description: string;
  image?: string;
}

export const buildHomeJsonLd = ({
  locale,
  path,
  siteName,
  description,
  image,
}: BuildHomeJsonLdParams): JsonLd[] => {
  return [
    createOrganizationSchema({
      path,
      name: siteName,
      description,
      image,
    }),
    createWebSiteSchema({
      path,
      name: siteName,
      description,
      locale,
    }),
  ].filter((item): item is JsonLd => Boolean(item));
};
