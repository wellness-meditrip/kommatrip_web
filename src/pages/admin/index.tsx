import Link from 'next/link';
import { css } from '@emotion/react';
import { Loading } from '@/components/common';
import {
  adminAccentButton,
  adminConsolePalette,
  adminHeroActions,
  adminHeroDescription,
  adminHeroSection,
  adminHeroTitle,
  adminGhostButton,
  adminPage,
  adminSectionHeader,
  adminSectionSubtitle,
  adminSectionTitle,
  adminSubtlePanel,
  adminSurfacePanel,
} from '@/components/admin/admin-console.styles';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { useAdminAccess, useAdminCompanyStatusBuckets } from '@/hooks';

export default function AdminIndexPage() {
  const { canAccess } = useAdminAccess();
  const { recentCompanies, totals, isLoading, hasError, errorMessage, refetchAll } =
    useAdminCompanyStatusBuckets(canAccess);

  if (isLoading) {
    return <Loading title="대시보드를 불러오는 중입니다." fullHeight />;
  }

  return (
    <div css={page}>
      <header css={hero}>
        <div css={heroCopy}>
          <Text tag="h1" typo="title1" css={adminHeroTitle}>
            대시보드
          </Text>
          <Text typo="body9" css={adminHeroDescription}>
            운영 핵심 지표와 자주 쓰는 작업을 한 화면에 배치했습니다.
          </Text>
        </div>
        <div css={heroActions}>
          <Link href={ROUTES.ADMIN_COMPANIES} css={secondaryLinkButton}>
            업체 관리
          </Link>
          <Link href={ROUTES.ADMIN_RESERVATIONS} css={secondaryLinkButton}>
            예약 관리
          </Link>
          <Link href={ROUTES.ADMIN_REVIEWS} css={secondaryLinkButton}>
            리뷰 관리
          </Link>
          <Link href={ROUTES.ADMIN_INFLUENCERS} css={secondaryLinkButton}>
            인플루언서 프로모션
          </Link>
          <Link href={ROUTES.ADMIN_COMPANY_NEW} css={primaryLinkButton}>
            업체 등록
          </Link>
        </div>
      </header>

      <section css={statsGrid}>
        <AdminStatCard label="활성 업체" value={String(totals.active)} />
        <AdminStatCard label="승인 대기 업체" value={String(totals.pending)} />
        <AdminStatCard label="중지 업체" value={String(totals.suspended)} />
      </section>

      {hasError && (
        <section css={panel}>
          <div css={sectionHeader}>
            <div>
              <Text tag="h2" typo="subtitle1" css={adminSectionTitle}>
                업체 목록을 불러오지 못했습니다.
              </Text>
              <Text typo="body10" css={adminSectionSubtitle}>
                {errorMessage}
              </Text>
            </div>
            <button type="button" css={retryButton} onClick={() => void refetchAll()}>
              다시 시도
            </button>
          </div>
        </section>
      )}

      <section css={quickSection}>
        <div css={sectionHeader}>
          <div>
            <Text tag="h2" typo="subtitle1" css={adminSectionTitle}>
              빠른 작업
            </Text>
            <Text typo="body10" css={adminSectionSubtitle}>
              업체 수정과 프로그램 관리는 업체 단위로 연결됩니다.
            </Text>
          </div>
        </div>
        <div css={quickGrid}>
          <Link href={ROUTES.ADMIN_COMPANIES} css={quickCard}>
            <Text typo="subtitle1" css={cardTitle}>
              업체 목록 보기
            </Text>
            <Text typo="body10" css={cardDescription}>
              전체 업체 검색, 수정, 프로그램 관리 진입
            </Text>
          </Link>
          <Link href={ROUTES.ADMIN_RESERVATIONS} css={quickCard}>
            <Text typo="subtitle1" css={cardTitle}>
              예약 현황 보기
            </Text>
            <Text typo="body10" css={cardDescription}>
              상태별 예약 목록과 상세 문의 내역 확인
            </Text>
          </Link>
          <Link href={ROUTES.ADMIN_REVIEWS} css={quickCard}>
            <Text typo="subtitle1" css={cardTitle}>
              리뷰 운영 보기
            </Text>
            <Text typo="body10" css={cardDescription}>
              업체 단위 리뷰 조회와 내용 확인
            </Text>
          </Link>
          <Link href={ROUTES.ADMIN_COMPANY_NEW} css={quickCard}>
            <Text typo="subtitle1" css={cardTitle}>
              신규 업체 등록
            </Text>
            <Text typo="body10" css={cardDescription}>
              새 업체를 등록하고 바로 프로그램까지 연결
            </Text>
          </Link>
        </div>
      </section>

      <section css={panel}>
        <div css={sectionHeader}>
          <div>
            <Text tag="h2" typo="subtitle1" css={adminSectionTitle}>
              최근 관리 대상 업체
            </Text>
            <Text typo="body10" css={adminSectionSubtitle}>
              프로그램 관리는 업체별 하위 화면에서 진행합니다.
            </Text>
          </div>
        </div>
        <div css={companyGrid}>
          {recentCompanies.map((company) => (
            <article key={company.id} css={companyCard}>
              <div css={companyCardBody}>
                <Text typo="subtitle1" css={cardTitle}>
                  {company.name}
                </Text>
                <Text typo="body10" css={cardDescription}>
                  {company.simpleplace || company.address}
                </Text>
              </div>
              <div css={companyActions}>
                <Link href={ROUTES.ADMIN_COMPANY_EDIT(company.id)} css={secondaryLinkButton}>
                  업체 수정
                </Link>
                <Link href={ROUTES.ADMIN_COMPANY_PROGRAMS(company.id)} css={primaryLinkButton}>
                  프로그램 관리
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const page = adminPage;

const hero = adminHeroSection;

const heroCopy = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const heroActions = adminHeroActions;

const primaryLinkButton = adminAccentButton;

const secondaryLinkButton = adminGhostButton;

const statsGrid = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const panel = adminSurfacePanel;

const quickSection = css`
  ${adminSurfacePanel};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const sectionHeader = adminSectionHeader;

const quickGrid = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const quickCard = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: 20px;
  text-decoration: none;
  background:
    radial-gradient(circle at top right, rgba(132, 155, 130, 0.12), transparent 36%),
    rgba(14, 22, 35, 0.94);
  border: 1px solid ${adminConsolePalette.borderSoft};
  box-shadow: 0 18px 48px rgba(2, 8, 18, 0.26);
`;

const cardTitle = css`
  color: ${adminConsolePalette.text};
`;

const cardDescription = css`
  color: ${adminConsolePalette.textSubtle};
`;

const companyGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const companyCard = css`
  ${adminSubtlePanel};
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const companyCardBody = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const companyActions = css`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const retryButton = css`
  ${adminGhostButton};
  border: none;
  cursor: pointer;
`;
