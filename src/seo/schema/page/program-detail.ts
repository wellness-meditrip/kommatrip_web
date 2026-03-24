import { ROUTES } from '@/constants';
import type { CompanyDetail } from '@/models';
import type { ProgramDetail } from '@/models/program';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createProgramSchema } from '../program';

interface BuildProgramDetailJsonLdParams {
  program: ProgramDetail;
  companyId: number;
  programId: number;
  locale: string;
  homeLabel: string;
  companyListLabel: string;
  pageTitle: string;
  company?: Pick<CompanyDetail, 'name' | 'address' | 'phone'> | null;
}

export const buildProgramDetailJsonLd = ({
  program,
  companyId,
  programId,
  locale,
  homeLabel,
  companyListLabel,
  pageTitle,
  company,
}: BuildProgramDetailJsonLdParams): JsonLd[] => {
  const companyDetailPath = `/${locale}${ROUTES.COMPANY_DETAIL(companyId)}`;
  const programDetailPath = `/${locale}${ROUTES.COMPANY_PROGRAM_DETAIL(companyId, programId)}`;

  return [
    createProgramSchema({
      program,
      path: programDetailPath,
      company,
      companyPath: companyDetailPath,
    }),
    createBreadcrumbSchema(
      [
        {
          name: homeLabel,
          path: `/${locale}`,
        },
        {
          name: companyListLabel,
          path: `/${locale}${ROUTES.COMPANY}`,
        },
        company
          ? {
              name: company.name,
              path: companyDetailPath,
            }
          : undefined,
        {
          name: pageTitle,
          path: programDetailPath,
        },
      ].filter(
        (
          item
        ): item is {
          name: string;
          path: string;
        } => Boolean(item)
      )
    ),
  ].filter((item): item is JsonLd => Boolean(item));
};
