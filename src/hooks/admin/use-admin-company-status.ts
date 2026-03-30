import { useMemo } from 'react';
import type { AdminCompanyListItem, AdminCompanyStatusFilter } from '@/models';
import { useGetAdminCompaniesQuery } from '@/queries';
import { normalizeError } from '@/utils/error-handler';
import { toSearchableText } from '@/utils/search';

export type AdminCompanyStatus = AdminCompanyStatusFilter;
export type AdminCompanyStatusTab = AdminCompanyStatus | 'all';

export interface AdminCompanyStatusRow extends AdminCompanyListItem {
  status: AdminCompanyStatus;
}

export const ADMIN_COMPANY_STATUS_META: Array<{ value: AdminCompanyStatusTab; label: string }> = [
  { value: 'active', label: '활성 업체' },
  { value: 'pending', label: '승인 대기' },
  { value: 'suspended', label: '중지 업체' },
  { value: 'all', label: '전체' },
];

export const ADMIN_COMPANY_STATUS_LABELS: Record<AdminCompanyStatus, string> = {
  active: '활성',
  pending: '승인 대기',
  suspended: '중지',
};

const withStatus = (
  companies: AdminCompanyListItem[] | undefined,
  status: AdminCompanyStatus
): AdminCompanyStatusRow[] => (companies ?? []).map((company) => ({ ...company, status }));

const dedupeCompanies = (companies: AdminCompanyStatusRow[]) => {
  const byId = new Map<number, AdminCompanyStatusRow>();

  for (const company of companies) {
    if (!byId.has(company.id)) {
      byId.set(company.id, company);
    }
  }

  return Array.from(byId.values());
};

export const formatAdminCompanyStatusLabel = (status: AdminCompanyStatus) =>
  ADMIN_COMPANY_STATUS_LABELS[status];

export const filterAdminCompaniesByKeyword = (
  companies: AdminCompanyStatusRow[],
  keyword: string
) => {
  const searchTerm = toSearchableText(keyword);
  if (!searchTerm) return companies;

  return companies.filter((company) => {
    const searchFields = [company.name, company.address, company.simpleplace ?? ''];

    return searchFields.some((field) => toSearchableText(field).includes(searchTerm));
  });
};

export const useAdminCompanyStatusBuckets = (enabled: boolean) => {
  const activeCompaniesQuery = useGetAdminCompaniesQuery('active', enabled);
  const pendingCompaniesQuery = useGetAdminCompaniesQuery('pending', enabled);
  const suspendedCompaniesQuery = useGetAdminCompaniesQuery('suspended', enabled);

  const companyBuckets = useMemo(
    () => ({
      active: withStatus(activeCompaniesQuery.data?.companies, 'active'),
      pending: withStatus(pendingCompaniesQuery.data?.companies, 'pending'),
      suspended: withStatus(suspendedCompaniesQuery.data?.companies, 'suspended'),
    }),
    [
      activeCompaniesQuery.data?.companies,
      pendingCompaniesQuery.data?.companies,
      suspendedCompaniesQuery.data?.companies,
    ]
  );

  const allCompanies = useMemo(
    () =>
      dedupeCompanies([
        ...companyBuckets.active,
        ...companyBuckets.pending,
        ...companyBuckets.suspended,
      ]),
    [companyBuckets.active, companyBuckets.pending, companyBuckets.suspended]
  );

  const companiesByTab = useMemo(
    () => ({
      all: allCompanies,
      active: companyBuckets.active,
      pending: companyBuckets.pending,
      suspended: companyBuckets.suspended,
    }),
    [allCompanies, companyBuckets.active, companyBuckets.pending, companyBuckets.suspended]
  );

  const counts = useMemo(
    () => ({
      all: allCompanies.length,
      active: companyBuckets.active.length,
      pending: companyBuckets.pending.length,
      suspended: companyBuckets.suspended.length,
    }),
    [
      allCompanies.length,
      companyBuckets.active.length,
      companyBuckets.pending.length,
      companyBuckets.suspended.length,
    ]
  );

  const totals = {
    active: activeCompaniesQuery.data?.total ?? companyBuckets.active.length,
    pending: pendingCompaniesQuery.data?.total ?? companyBuckets.pending.length,
    suspended: suspendedCompaniesQuery.data?.total ?? companyBuckets.suspended.length,
  };

  const recentCompanies = useMemo(
    () => [...companyBuckets.pending, ...companyBuckets.active].slice(0, 6),
    [companyBuckets.active, companyBuckets.pending]
  );

  const isLoading =
    !enabled ||
    activeCompaniesQuery.isLoading ||
    pendingCompaniesQuery.isLoading ||
    suspendedCompaniesQuery.isLoading;

  const hasError =
    activeCompaniesQuery.isError ||
    pendingCompaniesQuery.isError ||
    suspendedCompaniesQuery.isError;

  const errorMessage =
    normalizeError(
      activeCompaniesQuery.error || pendingCompaniesQuery.error || suspendedCompaniesQuery.error
    ).message || '업체 목록을 불러오지 못했습니다.';

  const refetchAll = () =>
    Promise.all([
      activeCompaniesQuery.refetch(),
      pendingCompaniesQuery.refetch(),
      suspendedCompaniesQuery.refetch(),
    ]);

  return {
    activeCompanies: companyBuckets.active,
    pendingCompanies: companyBuckets.pending,
    suspendedCompanies: companyBuckets.suspended,
    allCompanies,
    companiesByTab,
    counts,
    totals,
    recentCompanies,
    isLoading,
    hasError,
    errorMessage,
    refetchAll,
  };
};
