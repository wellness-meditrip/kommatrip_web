import Link from 'next/link';
import { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Loading } from '@/components/common';
import { AdminProgramFormPage } from '@/components/admin/program-form-page';
import {
  adminAccentButton,
  adminCompactHeader,
  adminCompactHeaderActions,
  adminCompactHeaderCopy,
  adminConsolePalette,
  adminDangerButton,
  adminEmptyDescription,
  adminEmptyState,
  adminEmptyTitle,
  adminGhostButton,
  adminPage,
  adminPrimaryButton,
  adminSegmentButton,
  adminSegmented,
  adminSectionSubtitle,
  adminSectionTitle,
  adminSummaryPill,
  adminSurfacePanel,
} from '@/components/admin/admin-console.styles';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { deleteAdminProgram, postAdminProgramActivate } from '@/apis';
import type { AdminProgramListItem } from '@/models';
import { useAdminAccess, useDialog, useToast } from '@/hooks';
import { useGetAdminCompanyDetailQuery, useGetAdminProgramsByCompanyQuery } from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { normalizeError } from '@/utils/error-handler';

type ProgramViewMode = 'table' | 'card';

const parseCompanyId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return Number(value[0]);
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
};

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const VIEW_OPTIONS: Array<{ value: ProgramViewMode; label: string }> = [
  { value: 'table', label: '표형' },
  { value: 'card', label: '카드형' },
];

const PROGRAM_STATUS_LABELS: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  draft: '임시 저장',
  suspended: '중지',
};

const formatProgramStatus = (status: string) => PROGRAM_STATUS_LABELS[status] ?? status;
const isProgramActive = (status: string) => status === 'active';
const canActivateProgram = (status: string) => status === 'draft' || status === 'inactive';

export default function AdminCompanyProgramsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canAccess } = useAdminAccess();
  const { showToast } = useToast();
  const { open: openDialog } = useDialog();
  const companyId = parseCompanyId(router.query.companyId);
  const [viewMode, setViewMode] = useState<ProgramViewMode>('table');
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isActivatingId, setIsActivatingId] = useState<number | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const companyDetailQuery = useGetAdminCompanyDetailQuery(
    Number.isNaN(companyId) ? null : companyId,
    canAccess && !Number.isNaN(companyId)
  );
  const companyCode = companyDetailQuery.data?.company?.company_code ?? null;
  const programsQuery = useGetAdminProgramsByCompanyQuery(companyCode, canAccess && !!companyCode);
  const programs = useMemo(
    () => programsQuery.data?.programs ?? [],
    [programsQuery.data?.programs]
  );

  const handleDelete = (program: AdminProgramListItem) => {
    openDialog({
      type: 'warn',
      title: `${program.name} 프로그램을 삭제할까요?`,
      description: '삭제 후에는 복구 기능이 연결되어 있지 않습니다.',
      primaryActionLabel: '삭제',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        try {
          setIsDeletingId(program.id);
          await deleteAdminProgram(program.id);
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAMS_BY_COMPANY, companyCode],
            }),
            queryClient.removeQueries({
              queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAM_DETAIL, program.id],
            }),
          ]);
          showToast({
            title: '프로그램이 삭제되었습니다.',
            icon: 'check',
          });
        } catch (error) {
          showToast({
            title: normalizeError(error).message || '프로그램 삭제에 실패했습니다.',
            icon: 'exclaim',
          });
        } finally {
          setIsDeletingId(null);
        }
      },
    });
  };

  const handleCloseEdit = () => {
    setEditingProgramId(null);
  };

  const handleToggleActivation = async (program: AdminProgramListItem, nextChecked: boolean) => {
    if (!nextChecked) {
      showToast({
        title: '프로그램 비활성화 API는 아직 연결되어 있지 않습니다.',
        icon: 'exclaim',
      });
      return;
    }

    if (!canActivateProgram(program.status)) {
      return;
    }

    try {
      setIsActivatingId(program.id);
      const response = await postAdminProgramActivate(program.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAMS_BY_COMPANY, companyCode],
        }),
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAM_DETAIL, program.id],
        }),
      ]);

      showToast({
        title: response.message || `${program.name} 프로그램이 활성화되었습니다.`,
        icon: 'check',
      });
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '프로그램 활성화에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setIsActivatingId(null);
    }
  };

  if (!router.isReady || !canAccess || companyDetailQuery.isLoading || programsQuery.isLoading) {
    return <Loading title="프로그램 목록을 불러오는 중입니다." fullHeight />;
  }

  if (Number.isNaN(companyId) || companyDetailQuery.isError) {
    return (
      <div css={page}>
        <section css={panel}>
          <Text tag="h1" typo="title1" css={adminEmptyTitle}>
            업체 정보를 불러오지 못했습니다.
          </Text>
          <Text typo="body9" css={adminEmptyDescription}>
            {companyDetailQuery.isError
              ? normalizeError(companyDetailQuery.error).message
              : '잘못된 업체 ID입니다.'}
          </Text>
        </section>
      </div>
    );
  }

  return (
    <div css={page}>
      <header css={pageHeader}>
        <div css={pageHeaderCopy}>
          <Text tag="h1" typo="title_S" css={pageHeaderTitle}>
            프로그램 관리
          </Text>
          <Text typo="body10" css={pageHeaderMeta}>
            업체별 프로그램 목록과 메타 정보를 콘솔 톤으로 관리합니다.
          </Text>
          <Text typo="body11" css={companyMeta}>
            {companyDetailQuery.data?.company?.name} / {companyCode}
          </Text>
        </div>
        <div css={pageHeaderActions}>
          <Link href={ROUTES.ADMIN_COMPANY_EDIT(companyId)} css={secondaryLinkButton}>
            업체 수정
          </Link>
          <Link href={ROUTES.ADMIN_COMPANY_PROGRAM_NEW(companyId)} css={primaryLinkButton}>
            프로그램 등록
          </Link>
        </div>
      </header>

      {programsQuery.isError ? (
        <section css={panel}>
          <Text typo="body4" css={adminEmptyTitle}>
            프로그램 목록을 불러오지 못했습니다.
          </Text>
          <Text typo="body10" css={adminEmptyDescription}>
            {normalizeError(programsQuery.error).message}
          </Text>
        </section>
      ) : programs.length ? (
        <>
          <div css={sectionHeader}>
            <div>
              <Text tag="h2" typo="subtitle1" css={adminSectionTitle}>
                프로그램 목록
              </Text>
              <Text typo="body10" css={adminSectionSubtitle}>
                총 {programs.length}개
              </Text>
            </div>
            <div css={sectionTools}>
              <span css={summaryPill}>{viewMode === 'table' ? '비교 보기' : '비주얼 보기'}</span>
              <div css={viewToggle}>
                {VIEW_OPTIONS.map((option) => {
                  const isActive = option.value === viewMode;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      css={viewToggleButton(isActive)}
                      onClick={() => setViewMode(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div css={tableWrap}>
              <table css={table}>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>프로그램명</th>
                    <th>상태</th>
                    <th>활성화</th>
                    <th>가격</th>
                    <th>소요시간</th>
                    <th>예약 수</th>
                    <th>조회수</th>
                    <th>생성일</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program, index) => (
                    <tr key={program.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div css={tablePrimaryCell}>
                          <Text typo="body4" css={tablePrimaryTitle}>
                            {program.name}
                          </Text>
                          <Text typo="body11" css={tableSecondaryText}>
                            ID {program.id}
                          </Text>
                        </div>
                      </td>
                      <td>
                        <span css={statusBadge(program.status)}>
                          {formatProgramStatus(program.status)}
                        </span>
                      </td>
                      <td>
                        <ProgramActivationToggle
                          checked={isProgramActive(program.status)}
                          disabled={
                            isActivatingId === program.id || !canActivateProgram(program.status)
                          }
                          onChange={(checked) => handleToggleActivation(program, checked)}
                        />
                      </td>
                      <td>KRW {program.price_info?.krw ?? '-'}</td>
                      <td>{program.duration_minutes ?? '-'}분</td>
                      <td>{program.reservations_count ?? 0}</td>
                      <td>{program.views_count ?? 0}</td>
                      <td>{formatDateTime(program.created_at)}</td>
                      <td>
                        <div css={rowActions}>
                          <button
                            type="button"
                            css={editLinkButton}
                            onClick={() => setEditingProgramId(program.id)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            css={deleteButton}
                            onClick={() => handleDelete(program)}
                            disabled={isDeletingId === program.id}
                          >
                            {isDeletingId === program.id ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div css={grid}>
              {programs.map((program) => (
                <article key={program.id} css={card}>
                  <div css={imageArea}>
                    {program.primary_image_url ? (
                      <div css={cardImage(program.primary_image_url)} />
                    ) : (
                      <div css={imagePlaceholder}>No Image</div>
                    )}
                  </div>
                  <div css={cardBody}>
                    <div css={cardHeader}>
                      <Text typo="subtitle1" css={cardTitle}>
                        {program.name}
                      </Text>
                      <span css={statusBadge(program.status)}>
                        {formatProgramStatus(program.status)}
                      </span>
                    </div>
                    <Text typo="body10" css={cardMeta}>
                      가격: KRW {program.price_info?.krw ?? '-'}
                    </Text>
                    <Text typo="body10" css={cardMeta}>
                      소요시간: {program.duration_minutes}분
                    </Text>
                    <Text typo="body10" css={cardMeta}>
                      예약 수: {program.reservations_count ?? 0} / 조회수:{' '}
                      {program.views_count ?? 0}
                    </Text>
                    <div css={activationRow}>
                      <Text typo="body11" css={activationLabel}>
                        프로그램 활성화
                      </Text>
                      <ProgramActivationToggle
                        checked={isProgramActive(program.status)}
                        disabled={
                          isActivatingId === program.id || !canActivateProgram(program.status)
                        }
                        onChange={(checked) => handleToggleActivation(program, checked)}
                      />
                    </div>
                    <Text typo="body11" css={cardMeta}>
                      생성일: {formatDateTime(program.created_at)}
                    </Text>
                  </div>
                  <div css={cardActions}>
                    <button
                      type="button"
                      css={editLinkButton}
                      onClick={() => setEditingProgramId(program.id)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      css={deleteButton}
                      onClick={() => handleDelete(program)}
                      disabled={isDeletingId === program.id}
                    >
                      {isDeletingId === program.id ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <section css={panel}>
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              등록된 프로그램이 없습니다.
            </Text>
          </div>
        </section>
      )}
      {editingProgramId !== null && (
        <AdminProgramFormPage
          mode="edit"
          companyId={companyId}
          programId={editingProgramId}
          presentation="sheet"
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
}

function ProgramActivationToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div css={activationToggleRow}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={checked ? '프로그램 활성 상태' : '프로그램 활성화'}
        css={activationToggle(checked, Boolean(disabled))}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span css={activationToggleThumb(checked)} />
      </button>
    </div>
  );
}

const page = adminPage;

const pageHeader = adminCompactHeader;

const pageHeaderCopy = adminCompactHeaderCopy;

const pageHeaderActions = adminCompactHeaderActions;

const pageHeaderTitle = adminSectionTitle;

const pageHeaderMeta = adminSectionSubtitle;

const companyMeta = css`
  color: ${adminConsolePalette.textDim};
`;

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const sectionTools = css`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const panel = adminSurfacePanel;

const summaryPill = adminSummaryPill;

const viewToggle = adminSegmented;

const viewToggleButton = (active: boolean) => css`
  ${adminSegmentButton(active)};
  min-width: 92px;
`;

const tableWrap = css`
  width: 100%;
  overflow-x: auto;
  border-radius: 24px;
  background: rgba(9, 15, 25, 0.88);
`;

const table = css`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  color: ${adminConsolePalette.textStrong};

  thead th {
    padding: 16px 18px;
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    color: ${adminConsolePalette.textSubtle};
    border-bottom: 1px solid ${adminConsolePalette.borderSoft};
    background: rgba(255, 255, 255, 0.02);
  }

  tbody td {
    padding: 18px;
    font-size: 14px;
    color: ${adminConsolePalette.textStrong};
    border-bottom: 1px solid rgba(148, 165, 184, 0.1);
    vertical-align: middle;
  }

  tbody tr:last-of-type td {
    border-bottom: none;
  }
`;

const tablePrimaryCell = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const tablePrimaryTitle = css`
  color: ${adminConsolePalette.text};
`;

const tableSecondaryText = css`
  color: ${adminConsolePalette.textDim};
`;

const rowActions = css`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const grid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const card = css`
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  background: rgba(14, 22, 35, 0.98);
  border: 1px solid ${adminConsolePalette.borderSoft};
  box-shadow: 0 18px 48px rgba(2, 8, 18, 0.24);
  overflow: hidden;
`;

const imageArea = css`
  padding: 16px 16px 0;
`;

const cardImage = (url: string) => css`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  background: url(${JSON.stringify(url)}) center / cover no-repeat;
`;

const imagePlaceholder = css`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: ${adminConsolePalette.textSubtle};
`;

const cardBody = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const cardHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const cardTitle = css`
  color: ${adminConsolePalette.text};
`;

const cardMeta = css`
  color: ${adminConsolePalette.textSubtle};
`;

const activationRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
`;

const activationLabel = css`
  color: ${adminConsolePalette.textMuted};
`;

const cardActions = css`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 16px 16px;
`;

const statusBadge = (status: string) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${status === 'active'
    ? adminConsolePalette.accentSoft
    : status === 'draft'
      ? adminConsolePalette.warningSoft
      : status === 'suspended'
        ? adminConsolePalette.dangerSoft
        : adminConsolePalette.infoSoft};
  color: ${status === 'active'
    ? adminConsolePalette.accentText
    : status === 'draft'
      ? adminConsolePalette.warningText
      : status === 'suspended'
        ? adminConsolePalette.dangerText
        : adminConsolePalette.infoText};
  font-size: 12px;
  font-weight: 800;
`;

const activationToggleRow = css`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const activationToggle = (checked: boolean, disabled: boolean) => css`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 46px;
  height: 28px;
  padding: 0 3px;
  border: none;
  border-radius: 999px;
  background: ${checked ? adminConsolePalette.accent : 'rgba(255, 255, 255, 0.14)'};
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  transition:
    background 0.18s ease,
    opacity 0.18s ease;
  opacity: ${disabled ? 0.55 : 1};
`;

const activationToggleThumb = (checked: boolean) => css`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #07111d;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
  transform: translateX(${checked ? '18px' : '0'});
  transition: transform 0.18s ease;
`;

const primaryLinkButton = adminAccentButton;

const secondaryLinkButton = adminGhostButton;

const compactListActionButton = css`
  min-width: 64px;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
`;

const editLinkButton = css`
  ${adminPrimaryButton};
  ${compactListActionButton};
`;

const deleteButton = css`
  ${adminDangerButton};
  ${compactListActionButton};
`;
