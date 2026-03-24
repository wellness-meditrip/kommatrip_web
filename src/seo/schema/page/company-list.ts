import type { Company } from '@/models';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createCompanyListSchema } from '../company-list';

interface BuildCompanyListJsonLdParams {
  companies: Company[];
  locale: string;
  pagePath: string;
  homeLabel: string;
  companyListLabel: string;
  pageTitle: string;
}

export const buildCompanyListJsonLd = ({
  companies,
  locale,
  pagePath,
  homeLabel,
  companyListLabel,
  pageTitle,
}: BuildCompanyListJsonLdParams): JsonLd[] => {
  return [
    createCompanyListSchema({
      companies,
      locale,
      path: pagePath,
      title: pageTitle,
    }),
    createBreadcrumbSchema([
      {
        name: homeLabel,
        path: `/${locale}`,
      },
      {
        name: companyListLabel,
        path: pagePath,
      },
    ]),
  ].filter((item): item is JsonLd => Boolean(item));
};
