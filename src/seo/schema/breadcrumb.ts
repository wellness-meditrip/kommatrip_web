import type { JsonLd } from '../meta.types';
import { getSchemaContext, normalizeSchemaString, toAbsoluteSchemaUrl } from './shared';

interface BreadcrumbItemInput {
  name: string;
  path: string;
}

export const createBreadcrumbSchema = (items: BreadcrumbItemInput[]): JsonLd | undefined => {
  const itemListElement = items
    .map((item, index) => {
      const name = normalizeSchemaString(item.name);
      const url = toAbsoluteSchemaUrl(item.path);

      if (!name || !url) {
        return undefined;
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: url,
      };
    })
    .filter(
      (
        item
      ): item is {
        '@type': string;
        position: number;
        name: string;
        item: string;
      } => Boolean(item)
    );

  if (itemListElement.length === 0) {
    return undefined;
  }

  return {
    '@context': getSchemaContext(),
    '@type': 'BreadcrumbList',
    itemListElement,
  };
};
