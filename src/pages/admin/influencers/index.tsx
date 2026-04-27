import { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  deleteAdminInfluencer,
  deleteAdminPromotionCode,
  patchAdminInfluencer,
  patchAdminPromotionCode,
  postAdminInfluencer,
  postAdminPromotionCode,
} from '@/apis';
import { Loading } from '@/components/common';
import {
  adminCapsuleBadge,
  adminConsolePalette,
  adminEmptyDescription,
  adminEmptyState,
  adminEmptyTitle,
  adminGhostButton,
  adminPage,
} from '@/components/admin/admin-console.styles';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { AdminSearchField } from '@/components/admin/common/AdminSearchField';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';
import { Text } from '@/components/text';
import { useAdminAccess, useDialog, useToast } from '@/hooks';
import type {
  AdminInfluencer,
  AdminInfluencerCreateRequest,
  AdminPromotionCode,
  AdminPromotionCodeCreateRequest,
} from '@/models';
import { useGetAdminInfluencersQuery } from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { normalizeError } from '@/utils/error-handler';
import { toSearchableText } from '@/utils/search';

const formatDate = (value?: string | null) => {
  if (!value) return '없음';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(parsed);
};

interface InfluencerFormState {
  influencer_name: string;
  program_id: string;
}

interface PromoCodeFormState {
  promotion_code: string;
  rate: string;
  is_multi_use: boolean;
  expires_on: string;
}

const defaultInfluencerForm = (base?: AdminInfluencer): InfluencerFormState => ({
  influencer_name: base?.influencer_name ?? '',
  program_id: base ? String(base.program_id) : '',
});

const defaultPromoForm = (base?: AdminPromotionCode): PromoCodeFormState => ({
  promotion_code: base?.promotion_code ?? '',
  rate: base ? String(base.rate) : '',
  is_multi_use: base?.is_multi_use ?? false,
  expires_on: base?.expires_on ? base.expires_on.slice(0, 10) : '',
});

export default function AdminInfluencersPage() {
  const queryClient = useQueryClient();
  const { canAccess } = useAdminAccess();
  const { open: openDialog } = useDialog();
  const { showToast } = useToast();

  const [keyword, setKeyword] = useState('');
  const [expandedCodeId, setExpandedCodeId] = useState<number | null>(null);

  // 인플루언서 폼 상태
  const [influencerFormMode, setInfluencerFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingInfluencer, setEditingInfluencer] = useState<AdminInfluencer | null>(null);
  const [influencerForm, setInfluencerForm] =
    useState<InfluencerFormState>(defaultInfluencerForm());
  const [influencerSubmitting, setInfluencerSubmitting] = useState(false);

  // 프로모션 코드 폼 상태
  const [promoFormInfluencerId, setPromoFormInfluencerId] = useState<number | null>(null);
  const [editingPromoCode, setEditingPromoCode] = useState<AdminPromotionCode | null>(null);
  const [promoForm, setPromoForm] = useState<PromoCodeFormState>(defaultPromoForm());
  const [promoSubmitting, setPromoSubmitting] = useState(false);

  const influencersQuery = useGetAdminInfluencersQuery({ limit: 100 }, canAccess);
  const allInfluencers = useMemo(() => influencersQuery.data?.items ?? [], [influencersQuery.data]);

  const influencers = useMemo(() => {
    const term = toSearchableText(keyword);
    if (!term) return allInfluencers;
    return allInfluencers.filter((inf) => toSearchableText(inf.influencer_name).includes(term));
  }, [allInfluencers, keyword]);

  const stats = useMemo(() => {
    const totalCodes = allInfluencers.reduce((sum, inf) => sum + inf.promotion_codes.length, 0);
    const multiUseCodes = allInfluencers.reduce(
      (sum, inf) => sum + inf.promotion_codes.filter((c) => c.is_multi_use).length,
      0
    );
    return { total: allInfluencers.length, totalCodes, multiUseCodes };
  }, [allInfluencers]);

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_ADMIN_INFLUENCERS });

  // ── 인플루언서 폼 핸들러 ──────────────────────────────────────────────────

  const openInfluencerCreate = () => {
    setEditingInfluencer(null);
    setInfluencerForm(defaultInfluencerForm());
    setInfluencerFormMode('create');
    setPromoFormInfluencerId(null);
  };

  const openInfluencerEdit = (influencer: AdminInfluencer) => {
    setEditingInfluencer(influencer);
    setInfluencerForm(defaultInfluencerForm(influencer));
    setInfluencerFormMode('edit');
    setPromoFormInfluencerId(null);
  };

  const closeInfluencerForm = () => {
    setInfluencerFormMode(null);
    setEditingInfluencer(null);
  };

  const handleInfluencerSubmit = async () => {
    const name = influencerForm.influencer_name.trim();
    const programId = parseInt(influencerForm.program_id, 10);
    if (!name || Number.isNaN(programId)) {
      showToast({ title: '인플루언서명과 프로그램 ID를 입력해 주세요.', icon: 'exclaim' });
      return;
    }

    setInfluencerSubmitting(true);
    try {
      if (influencerFormMode === 'edit' && editingInfluencer) {
        const res = await patchAdminInfluencer(editingInfluencer.id, {
          influencer_name: name,
          program_id: programId,
        });
        showToast({ title: res.message || '인플루언서가 수정되었습니다.', icon: 'check' });
      } else {
        const body: AdminInfluencerCreateRequest = {
          influencer_name: name,
          program_id: programId,
        };
        const res = await postAdminInfluencer(body);
        showToast({ title: res.message || '인플루언서가 등록되었습니다.', icon: 'check' });
      }
      closeInfluencerForm();
      await refetch();
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '처리에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setInfluencerSubmitting(false);
    }
  };

  const handleInfluencerDelete = (influencer: AdminInfluencer) => {
    openDialog({
      type: 'warn',
      title: `"${influencer.influencer_name}" 인플루언서를 삭제할까요?`,
      description: '연결된 프로모션 코드도 모두 삭제됩니다.',
      primaryActionLabel: '삭제',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        try {
          const res = await deleteAdminInfluencer(influencer.id);
          showToast({ title: res.message || '삭제되었습니다.', icon: 'check' });
          await refetch();
        } catch (error) {
          showToast({
            title: normalizeError(error).message || '삭제에 실패했습니다.',
            icon: 'exclaim',
          });
        }
      },
    });
  };

  // ── 프로모션 코드 폼 핸들러 ──────────────────────────────────────────────

  const openPromoCreate = (influencerId: number) => {
    setEditingPromoCode(null);
    setPromoForm(defaultPromoForm());
    setPromoFormInfluencerId(influencerId);
    setInfluencerFormMode(null);
    setExpandedCodeId(influencerId);
  };

  const openPromoEdit = (code: AdminPromotionCode) => {
    setEditingPromoCode(code);
    setPromoForm(defaultPromoForm(code));
    setPromoFormInfluencerId(code.influencer_id);
    setInfluencerFormMode(null);
    setExpandedCodeId(code.influencer_id);
  };

  const closePromoForm = () => {
    setPromoFormInfluencerId(null);
    setEditingPromoCode(null);
  };

  const handlePromoSubmit = async () => {
    const code = promoForm.promotion_code.trim();
    const rate = Number.parseFloat(promoForm.rate);
    if (!code || Number.isNaN(rate) || rate <= 0 || rate > 1) {
      showToast({
        title: '코드명과 유효한 할인율(0 초과 1 이하)을 입력해 주세요.',
        icon: 'exclaim',
      });
      return;
    }
    const expires_on = promoForm.expires_on || null;

    setPromoSubmitting(true);
    try {
      if (editingPromoCode) {
        const res = await patchAdminPromotionCode(editingPromoCode.id, {
          promotion_code: code,
          rate,
          is_multi_use: promoForm.is_multi_use,
          expires_on,
        });
        showToast({ title: res.message || '프로모션 코드가 수정되었습니다.', icon: 'check' });
      } else {
        if (promoFormInfluencerId === null) return;
        const body: AdminPromotionCodeCreateRequest = {
          promotion_code: code,
          rate,
          is_multi_use: promoForm.is_multi_use,
          expires_on,
        };
        const res = await postAdminPromotionCode(promoFormInfluencerId, body);
        showToast({ title: res.message || '프로모션 코드가 등록되었습니다.', icon: 'check' });
      }
      closePromoForm();
      await refetch();
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '처리에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setPromoSubmitting(false);
    }
  };

  const handlePromoDelete = (code: AdminPromotionCode) => {
    openDialog({
      type: 'warn',
      title: `"${code.promotion_code}" 코드를 삭제할까요?`,
      description: '삭제 후에는 복구할 수 없습니다.',
      primaryActionLabel: '삭제',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        try {
          const res = await deleteAdminPromotionCode(code.id);
          showToast({ title: res.message || '삭제되었습니다.', icon: 'check' });
          await refetch();
        } catch (error) {
          showToast({
            title: normalizeError(error).message || '삭제에 실패했습니다.',
            icon: 'exclaim',
          });
        }
      },
    });
  };

  if (!canAccess || (influencersQuery.isLoading && !influencersQuery.data)) {
    return <Loading title="인플루언서 프로모션 화면을 준비하는 중입니다." fullHeight />;
  }

  return (
    <div css={page}>
      <AdminPageHeader
        title="인플루언서 프로모션"
        description="인플루언서와 협업한 프로그램의 프로모션 코드를 관리합니다."
        actions={
          <div css={headerActions}>
            <button type="button" css={adminGhostButton} onClick={() => influencersQuery.refetch()}>
              새로고침
            </button>
            <button type="button" css={primaryButton} onClick={openInfluencerCreate}>
              + 인플루언서 등록
            </button>
          </div>
        }
      />

      {/* 통계 */}
      <section css={statsGrid}>
        <AdminStatCard as="div" label="전체 인플루언서" value={stats.total} />
        <AdminStatCard as="div" label="전체 프로모션 코드" value={stats.totalCodes} />
        <AdminStatCard as="div" label="중복 사용 코드" value={stats.multiUseCodes} />
      </section>

      {/* 인플루언서 등록/수정 폼 */}
      {influencerFormMode !== null && (
        <section css={formPanel}>
          <Text typo="body4" css={formTitle}>
            {influencerFormMode === 'edit' ? '인플루언서 수정' : '인플루언서 등록'}
          </Text>
          <div css={formRow}>
            <label css={formLabel}>
              인플루언서명
              <input
                css={formInput}
                value={influencerForm.influencer_name}
                onChange={(e) =>
                  setInfluencerForm((prev) => ({ ...prev, influencer_name: e.target.value }))
                }
                placeholder="예: influencer_name"
              />
            </label>
            <label css={formLabel}>
              프로그램 ID
              <input
                css={formInput}
                type="number"
                value={influencerForm.program_id}
                onChange={(e) =>
                  setInfluencerForm((prev) => ({ ...prev, program_id: e.target.value }))
                }
                placeholder="프로그램 ID 입력"
              />
            </label>
          </div>
          <div css={formActions}>
            <button type="button" css={adminGhostButton} onClick={closeInfluencerForm}>
              취소
            </button>
            <button
              type="button"
              css={primaryButton}
              onClick={handleInfluencerSubmit}
              disabled={influencerSubmitting}
            >
              {influencerSubmitting
                ? '처리 중...'
                : influencerFormMode === 'edit'
                  ? '수정'
                  : '등록'}
            </button>
          </div>
        </section>
      )}

      {/* 검색 */}
      <section css={toolbar}>
        <AdminSearchField
          value={keyword}
          onChange={setKeyword}
          placeholder="인플루언서명 검색"
          containerCss={searchField}
        />
      </section>

      {/* 인플루언서 목록 */}
      <section css={resultPanel}>
        <AdminPageHeader
          as="div"
          containerCss={resultPanelHeader}
          title="인플루언서 목록"
          description={
            influencersQuery.isFetching
              ? '목록을 업데이트하는 중입니다.'
              : '백엔드 관리자 인플루언서 API 기준'
          }
          actions={
            <Text typo="body9" css={resultCount}>
              총 {influencers.length}명
            </Text>
          }
        />

        {influencersQuery.isError ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              목록을 불러오지 못했습니다.
            </Text>
            <Text typo="body10" css={adminEmptyDescription}>
              {normalizeError(influencersQuery.error).message}
            </Text>
          </div>
        ) : influencers.length === 0 ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              {keyword ? '검색 결과가 없습니다.' : '등록된 인플루언서가 없습니다.'}
            </Text>
            <Text typo="body10" css={adminEmptyDescription}>
              {keyword
                ? '검색어를 조정한 뒤 다시 조회해 주세요.'
                : '상단 버튼으로 인플루언서를 등록해 주세요.'}
            </Text>
          </div>
        ) : (
          <div css={tableWrap}>
            <table css={table}>
              <thead>
                <tr>
                  <th>인플루언서</th>
                  <th>프로그램 ID</th>
                  <th>프로모션 코드</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((influencer) => {
                  const isExpanded = expandedCodeId === influencer.id;
                  const isPromoFormOpen =
                    promoFormInfluencerId === influencer.id && influencerFormMode === null;

                  return (
                    <>
                      <tr key={influencer.id}>
                        <td>
                          <div css={identityCell}>
                            <Text typo="body9" css={primaryCellText}>
                              {influencer.influencer_name}
                            </Text>
                            <Text typo="body11" css={secondaryCellText}>
                              ID {influencer.id}
                            </Text>
                          </div>
                        </td>
                        <td>
                          <Text typo="body10" css={primaryCellText}>
                            {influencer.program_id}
                          </Text>
                        </td>
                        <td>
                          <button
                            type="button"
                            css={codeCountBadge(isExpanded)}
                            onClick={() => setExpandedCodeId(isExpanded ? null : influencer.id)}
                          >
                            {influencer.promotion_codes.length}개 {isExpanded ? '▲' : '▼'}
                          </button>
                        </td>
                        <td>
                          <div css={rowActions}>
                            <AdminActionButton onClick={() => openInfluencerEdit(influencer)}>
                              수정
                            </AdminActionButton>
                            <AdminActionButton onClick={() => openPromoCreate(influencer.id)}>
                              코드 추가
                            </AdminActionButton>
                            <AdminActionButton
                              variant="danger"
                              onClick={() => handleInfluencerDelete(influencer)}
                            >
                              삭제
                            </AdminActionButton>
                          </div>
                        </td>
                      </tr>

                      {/* 프로모션 코드 폼 (해당 인플루언서 행 바로 아래) */}
                      {isPromoFormOpen && (
                        <tr key={`${influencer.id}-promo-form`}>
                          <td colSpan={4} css={expandedCell}>
                            <div css={promoFormPanel}>
                              <Text typo="body9" css={promoFormTitle}>
                                {editingPromoCode ? '프로모션 코드 수정' : '프로모션 코드 등록'}
                              </Text>
                              <div css={formRow}>
                                <label css={formLabel}>
                                  코드
                                  <input
                                    css={formInput}
                                    value={promoForm.promotion_code}
                                    onChange={(e) =>
                                      setPromoForm((prev) => ({
                                        ...prev,
                                        promotion_code: e.target.value,
                                      }))
                                    }
                                    placeholder="예: INFLUENCER10"
                                  />
                                </label>
                                <label css={formLabel}>
                                  할인율
                                  <input
                                    css={formInput}
                                    type="number"
                                    min={0}
                                    max={1}
                                    step="0.1"
                                    value={promoForm.rate}
                                    onChange={(e) =>
                                      setPromoForm((prev) => ({ ...prev, rate: e.target.value }))
                                    }
                                    placeholder="30퍼센트 할인 적용 시 0.3 입력"
                                  />
                                </label>
                                <label css={formLabel}>
                                  만료일
                                  <input
                                    css={formInput}
                                    type="date"
                                    value={promoForm.expires_on}
                                    onChange={(e) =>
                                      setPromoForm((prev) => ({
                                        ...prev,
                                        expires_on: e.target.value,
                                      }))
                                    }
                                  />
                                </label>
                              </div>
                              <label css={checkboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={promoForm.is_multi_use}
                                  onChange={(e) =>
                                    setPromoForm((prev) => ({
                                      ...prev,
                                      is_multi_use: e.target.checked,
                                    }))
                                  }
                                />
                                중복 사용 가능
                              </label>
                              <div css={formActions}>
                                <button
                                  type="button"
                                  css={adminGhostButton}
                                  onClick={closePromoForm}
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  css={primaryButton}
                                  onClick={handlePromoSubmit}
                                  disabled={promoSubmitting}
                                >
                                  {promoSubmitting
                                    ? '처리 중...'
                                    : editingPromoCode
                                      ? '수정'
                                      : '등록'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* 프로모션 코드 목록 (아코디언) */}
                      {isExpanded && (
                        <tr key={`${influencer.id}-codes`}>
                          <td colSpan={4} css={expandedCell}>
                            {influencer.promotion_codes.length === 0 ? (
                              <Text typo="body10" css={noCodesText}>
                                등록된 프로모션 코드가 없습니다.
                              </Text>
                            ) : (
                              <table css={innerTable}>
                                <thead>
                                  <tr>
                                    <th>코드</th>
                                    <th>할인율</th>
                                    <th>사용 횟수</th>
                                    <th>중복 사용</th>
                                    <th>만료일</th>
                                    <th>액션</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {influencer.promotion_codes.map((code) => (
                                    <tr key={code.id}>
                                      <td>
                                        <Text typo="body9" css={codeText}>
                                          {code.promotion_code}
                                        </Text>
                                      </td>
                                      <td>
                                        <Text typo="body10" css={secondaryCellText}>
                                          {code.rate}
                                        </Text>
                                      </td>
                                      <td>
                                        <Text typo="body10" css={secondaryCellText}>
                                          {code.usage_count}회
                                        </Text>
                                      </td>
                                      <td>
                                        <span css={multiUseBadge(code.is_multi_use)}>
                                          {code.is_multi_use ? '가능' : '불가'}
                                        </span>
                                      </td>
                                      <td>
                                        <Text typo="body10" css={secondaryCellText}>
                                          {formatDate(code.expires_on)}
                                        </Text>
                                      </td>
                                      <td>
                                        <div css={rowActions}>
                                          <AdminActionButton onClick={() => openPromoEdit(code)}>
                                            수정
                                          </AdminActionButton>
                                          <AdminActionButton
                                            variant="danger"
                                            onClick={() => handlePromoDelete(code)}
                                          >
                                            삭제
                                          </AdminActionButton>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ── 스타일 ────────────────────────────────────────────────────────────────────

const page = adminPage;

const headerActions = css`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const primaryButton = css`
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const statsGrid = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const formPanel = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(21, 31, 48, 0.96);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const formTitle = css`
  color: ${adminConsolePalette.textStrong};
`;

const formRow = css`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const formLabel = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 200px;
  color: ${adminConsolePalette.textSubtle};
  font-size: 13px;
`;

const formInput = css`
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${adminConsolePalette.borderSoft};
  background: rgba(255, 255, 255, 0.05);
  color: ${adminConsolePalette.textStrong};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const checkboxLabel = css`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${adminConsolePalette.textSubtle};
  font-size: 13px;
  cursor: pointer;
`;

const formActions = css`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const toolbar = css`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const searchField = css`
  flex: 1 1 360px;
  min-width: min(100%, 280px);
`;

const resultPanel = css`
  border-radius: 28px;
  background: rgba(7, 13, 23, 0.94);
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(2, 6, 14, 0.24);
`;

const resultPanelHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid ${adminConsolePalette.borderSoft};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const resultCount = css`
  color: #9dadc4;
`;

const tableWrap = css`
  width: 100%;
  overflow-x: auto;
`;

const table = css`
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;

  thead tr {
    background: rgba(21, 31, 48, 0.96);
  }

  th {
    padding: 18px 20px;
    text-align: left;
    color: #95a4bb;
    font-size: 14px;
    font-weight: 700;
    border-bottom: 1px solid rgba(142, 164, 190, 0.12);
  }

  td {
    padding: 18px 20px;
    border-bottom: 1px solid rgba(142, 164, 190, 0.08);
    vertical-align: middle;
  }

  tbody tr {
    transition: background 0.16s ease;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const innerTable = css`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  overflow: hidden;

  th {
    padding: 12px 16px;
    text-align: left;
    color: #95a4bb;
    font-size: 13px;
    font-weight: 700;
    background: rgba(21, 31, 48, 0.6);
    border-bottom: 1px solid rgba(142, 164, 190, 0.08);
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(142, 164, 190, 0.06);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const expandedCell = css`
  padding: 0 20px 16px !important;
  background: rgba(255, 255, 255, 0.01);
`;

const promoFormPanel = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(21, 31, 48, 0.8);
  border: 1px solid ${adminConsolePalette.borderSoft};
  margin-bottom: 4px;
`;

const promoFormTitle = css`
  color: ${adminConsolePalette.textStrong};
`;

const noCodesText = css`
  color: ${adminConsolePalette.textSubtle};
  padding: 12px 0;
  display: block;
`;

const identityCell = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const rowActions = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const primaryCellText = css`
  color: ${adminConsolePalette.textStrong};
`;

const secondaryCellText = css`
  color: ${adminConsolePalette.textSubtle};
`;

const codeText = css`
  color: ${adminConsolePalette.textStrong};
  font-family: monospace;
  letter-spacing: 0.02em;
`;

const codeCountBadge = (active: boolean) => css`
  ${adminCapsuleBadge({
    background: active ? 'rgba(59,130,246,0.18)' : adminConsolePalette.surfaceSubtle,
    color: active ? '#60a5fa' : adminConsolePalette.textSubtle,
  })};
  cursor: pointer;
  border: none;
  font-size: 13px;
  gap: 4px;
`;

const multiUseBadge = (active: boolean) => css`
  ${adminCapsuleBadge({
    background: active ? 'rgba(34,197,94,0.12)' : adminConsolePalette.surfaceSubtle,
    color: active ? '#4ade80' : adminConsolePalette.textSubtle,
  })};
`;
