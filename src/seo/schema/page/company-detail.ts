import { ROUTES } from '@/constants';
import type { CompanyDetail } from '@/models';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createCompanySchema } from '../company';

interface BuildCompanyDetailJsonLdParams {
  company: CompanyDetail;
  companyId: number;
  locale: string;
  homeLabel: string;
  companyListLabel: string;
  pageTitle: string;
}

export const buildCompanyDetailJsonLd = ({
  company,
  companyId,
  locale,
  homeLabel,
  companyListLabel,
  pageTitle,
}: BuildCompanyDetailJsonLdParams): JsonLd[] => {
  const companyDetailPath = `/${locale}${ROUTES.COMPANY_DETAIL(companyId)}`;

  return [
    createCompanySchema({
      company,
      path: companyDetailPath,
    }),
    createBreadcrumbSchema([
      {
        name: homeLabel,
        path: `/${locale}`,
      },
      {
        name: companyListLabel,
        path: `/${locale}${ROUTES.COMPANY}`,
      },
      {
        name: pageTitle,
        path: companyDetailPath,
      },
    ]),
  ].filter((item): item is JsonLd => Boolean(item));
};
