import { ROUTES } from '@/constants';
import type { Company } from '@/models';
import type { JsonLd } from '../meta.types';
import {
  buildSchemaId,
  getSchemaContext,
  normalizeSchemaString,
  toAbsoluteSchemaUrl,
} from './shared';

interface CreateCompanyListSchemaParams {
  companies: Company[];
  locale: string;
  path: string;
  title?: string;
}

export const createCompanyListSchema = ({
  companies,
  locale,
  path,
  title,
}: CreateCompanyListSchemaParams): JsonLd | undefined => {
  const itemListElement = companies
    .map((company, index) => {
      const name = normalizeSchemaString(company.name);
      const url = toAbsoluteSchemaUrl(`/${locale}${ROUTES.COMPANY_DETAIL(company.id)}`);

      if (!name || !url) {
        return undefined;
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        url,
        name,
      };
    })
    .filter(
      (
        item
      ): item is {
        '@type': string;
        position: number;
        url: string;
        name: string;
      } => Boolean(item)
    );

  if (itemListElement.length === 0) {
    return undefined;
  }

  const url = toAbsoluteSchemaUrl(path);

  return {
    '@context': getSchemaContext(),
    '@type': 'ItemList',
    '@id': buildSchemaId(path, 'itemlist') ?? url,
    url,
    name: normalizeSchemaString(title),
    numberOfItems: itemListElement.length,
    itemListElement,
  };
};
