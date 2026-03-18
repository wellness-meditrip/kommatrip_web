import { useRouter } from 'next/router';
import { Loading } from '@/components/common';
import { AdminProgramFormPage } from '@/components/admin/program-form-page';

const parseId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return Number(value[0]);
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
};

export default function AdminProgramEditPage() {
  const router = useRouter();
  const companyId = parseId(router.query.companyId);
  const programId = parseId(router.query.programId);

  if (!router.isReady) {
    return <Loading title="프로그램 수정 화면을 준비하는 중입니다." fullHeight />;
  }

  if (Number.isNaN(companyId) || Number.isNaN(programId)) {
    return <Loading title="프로그램 정보를 확인하는 중입니다." fullHeight />;
  }

  return <AdminProgramFormPage mode="edit" companyId={companyId} programId={programId} />;
}
