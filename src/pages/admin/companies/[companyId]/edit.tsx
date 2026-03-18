import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { Loading } from '@/components/common';
import { Text } from '@/components/text';
import { AdminCompanyFormPage } from '@/components/admin/company-form-page';
import { colors } from '@/styles';

const parseCompanyId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return Number(value[0]);
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
};

export default function AdminCompanyEditPage() {
  const router = useRouter();
  const companyId = parseCompanyId(router.query.companyId);

  if (!router.isReady) {
    return <Loading title="업체 수정 페이지를 준비하는 중입니다." fullHeight />;
  }

  if (Number.isNaN(companyId)) {
    return (
      <div css={invalidPage}>
        <div css={invalidCard}>
          <Text tag="h1" typo="title1">
            잘못된 업체 ID입니다.
          </Text>
          <Text typo="body9" color="text_secondary">
            수정하려는 업체 식별자를 다시 확인해주세요.
          </Text>
        </div>
      </div>
    );
  }

  return <AdminCompanyFormPage mode="edit" companyId={companyId} />;
}

const invalidPage = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
`;

const invalidCard = css`
  padding: 28px;
  border-radius: 24px;
  background: ${colors.white};
  box-shadow: 0 18px 48px rgba(35, 26, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
