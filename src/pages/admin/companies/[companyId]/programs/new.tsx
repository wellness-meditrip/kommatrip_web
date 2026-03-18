import { useRouter } from 'next/router';
import { Loading } from '@/components/common';
import { AdminProgramFormPage } from '@/components/admin/program-form-page';

const parseCompanyId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return Number(value[0]);
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
};

export default function AdminProgramCreatePage() {
  const router = useRouter();
  const companyId = parseCompanyId(router.query.companyId);

  if (!router.isReady) {
    return <Loading title="프로그램 등록 화면을 준비하는 중입니다." fullHeight />;
  }

  if (Number.isNaN(companyId)) {
    return <Loading title="업체 정보를 확인하는 중입니다." fullHeight />;
  }

  return <AdminProgramFormPage mode="create" companyId={companyId} />;
}
