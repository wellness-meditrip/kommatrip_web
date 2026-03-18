import { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  deleteAdminReservation,
  postAdminReservationComplete,
  postAdminReservationConfirm,
  postAdminReservationNoShow,
  postAdminReservationReject,
  putAdminReservation,
} from '@/apis';
import { Loading } from '@/components/common';
import {
  adminCapsuleBadge,
  adminConsolePalette,
  adminConsoleSection,
  adminEmptyDescription,
  adminEmptyState,
  adminEmptyTitle,
  adminGhostButton,
  adminPage,
  adminSectionSubtitle,
  adminSectionTitle,
  adminSegmentButton,
  adminSegmented,
} from '@/components/admin/admin-console.styles';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { AdminSearchField } from '@/components/admin/common/AdminSearchField';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';
import { Text } from '@/components/text';
import { useAdminRouteGuard, useDialog, useToast } from '@/hooks';
import type {
  AdminReservationDetail,
  AdminReservationListStatus,
  AvailabilityOption,
} from '@/models';
import {
  useGetAdminReservationDetailQuery,
  useGetAdminReservationsQuery,
  useGetAdminReservationStatsQuery,
} from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { normalizeError } from '@/utils/error-handler';
import { toSearchableText } from '@/utils/search';

const STATUS_OPTIONS = [
  { value: 'pending', label: '예약 대기' },
  { value: 'confirmed', label: '승인' },
  { value: 'rejected', label: '거절' },
  { value: 'completed', label: '방문 완료' },
  { value: 'no-show', label: '노쇼' },
  { value: 'canceled', label: '취소' },
] as const;

type ReservationActionType =
  | 'confirm'
  | 'reject'
  | 'cancel'
  | 'complete'
  | 'no_show'
  | 'edit_visit';

const ACTION_LABELS: Record<ReservationActionType, string> = {
  confirm: '예약 승인',
  reject: '예약 거절',
  cancel: '예약 취소',
  complete: '방문 완료',
  no_show: '노쇼 처리',
  edit_visit: '방문 일정 수정',
};

const getActionButtonVariant = (action: ReservationActionType) => {
  switch (action) {
    case 'confirm':
    case 'complete':
      return 'primary' as const;
    case 'reject':
    case 'cancel':
    case 'no_show':
      return 'danger' as const;
    case 'edit_visit':
    default:
      return 'ghost' as const;
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const formatStatus = (value?: string | null) => {
  switch (value) {
    case 'request':
      return '예약 대기';
    case 'confirmed':
      return '승인';
    case 'rejected':
      return '거절';
    case 'completed':
      return '방문 완료';
    case 'no_show':
      return '노쇼';
    case 'canceled':
      return '취소';
    default:
      return value || '-';
  }
};

const normalizeReservationStatus = (value?: string | null) => {
  if (!value) return '';
  if (value === 'pending') return 'request';
  if (value === 'no-show') return 'no_show';
  return value;
};

const getReservationActions = (status?: string | null): ReservationActionType[] => {
  switch (normalizeReservationStatus(status)) {
    case 'request':
      return ['confirm', 'reject', 'cancel', 'edit_visit'];
    case 'confirmed':
      return ['complete', 'no_show', 'cancel', 'edit_visit'];
    case 'completed':
      return ['no_show', 'edit_visit'];
    case 'rejected':
    case 'no_show':
    case 'canceled':
      return ['edit_visit'];
    default:
      return [];
  }
};

const getPromptSafeDateTime = (value?: string | null) => {
  if (!value) return '';
  return value
    .replace('T', ' ')
    .replace(/(\.\d+)?([+-]\d{2}:\d{2}|Z)$/, '')
    .slice(0, 16);
};

const getAvailabilityPromptValue = (reservation?: AdminReservationDetail | null) => {
  const availabilityEntries =
    reservation?.availability_options
      ?.flatMap((option) =>
        (option.times ?? []).map((time) => `${option.date} ${time.slice(0, 5)}`)
      )
      .slice(0, 2) ?? [];

  if (availabilityEntries.length > 0) {
    return availabilityEntries.join(', ');
  }

  return getPromptSafeDateTime(reservation?.visit_date);
};

const parseAvailabilityOptions = (input: string): AvailabilityOption[] => {
  const slots = input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (slots.length === 0) {
    throw new Error('최소 1개의 방문일시를 입력해 주세요.');
  }

  if (slots.length > 2) {
    throw new Error('최대 2개의 날짜/시간만 입력할 수 있습니다.');
  }

  const dateMap = new Map<string, string[]>();

  for (const slot of slots) {
    const [date, rawTime] = slot.split(/\s+/);
    if (!date || !rawTime) {
      throw new Error('형식이 올바르지 않습니다. 예: 2026-03-21 14:00, 2026-03-22 10:30');
    }

    const timeParts = rawTime.split(':');
    const hh = (timeParts[0] || '').padStart(2, '0');
    const mm = (timeParts[1] || '00').padStart(2, '0');
    const ss = (timeParts[2] || '00').padStart(2, '0');

    if (!/^\d{2}$/.test(hh) || !/^\d{2}$/.test(mm) || !/^\d{2}$/.test(ss)) {
      throw new Error('시간 형식이 올바르지 않습니다. 예: 14:00 또는 14:00:00');
    }

    const currentTimes = dateMap.get(date) ?? [];
    if (currentTimes.length >= 3) {
      throw new Error(`${date}에는 최대 3개 시간만 입력할 수 있습니다.`);
    }

    currentTimes.push(`${hh}:${mm}:${ss}`);
    dateMap.set(date, currentTimes);
  }

  return Array.from(dateMap.entries()).map(([date, times]) => ({
    date,
    times,
  }));
};

export default function AdminReservationsPage() {
  const queryClient = useQueryClient();
  const { canAccess, isReady } = useAdminRouteGuard();
  const { open: openDialog } = useDialog();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<AdminReservationListStatus>('pending');
  const [keyword, setKeyword] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState<number | string | null>(null);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

  const reservationsQuery = useGetAdminReservationsQuery(
    {
      skip: 0,
      limit: 100,
      status: statusFilter,
    },
    canAccess
  );
  const statsQuery = useGetAdminReservationStatsQuery({}, canAccess);

  const filteredReservations = useMemo(() => {
    const searchTerm = toSearchableText(keyword);
    const list = reservationsQuery.data?.reservations ?? [];
    if (!searchTerm) return list;

    return list.filter((reservation) => {
      const searchFields = [
        reservation.company_name,
        reservation.program_name,
        reservation.company_address,
        reservation.reservation_code,
        reservation.customer_email,
        reservation.customer_name,
      ];

      return searchFields.some((field) => toSearchableText(field).includes(searchTerm));
    });
  }, [keyword, reservationsQuery.data?.reservations]);

  useEffect(() => {
    if (filteredReservations.length === 0) {
      setSelectedReservationId(null);
      return;
    }

    const hasSelected = filteredReservations.some(
      (reservation) => reservation.id === selectedReservationId
    );
    if (!hasSelected) {
      setSelectedReservationId(filteredReservations[0]?.id ?? null);
    }
  }, [filteredReservations, selectedReservationId]);

  const reservationDetailQuery = useGetAdminReservationDetailQuery(
    selectedReservationId,
    canAccess && !!selectedReservationId
  );

  const selectedReservation = reservationDetailQuery.data?.reservation ?? null;
  const availableActions = useMemo(
    () => getReservationActions(selectedReservation?.status),
    [selectedReservation?.status]
  );

  const stats = useMemo(
    () => ({
      request: statsQuery.data?.counts.request ?? 0,
      confirmed: statsQuery.data?.counts.confirmed ?? 0,
      rejected: statsQuery.data?.counts.rejected ?? 0,
      completed: statsQuery.data?.counts.completed ?? 0,
      no_show: statsQuery.data?.counts.no_show ?? 0,
      canceled: statsQuery.data?.counts.canceled ?? 0,
    }),
    [statsQuery.data]
  );

  const refreshReservationViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_ADMIN_RESERVATIONS,
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_ADMIN_RESERVATION_STATS,
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_ADMIN_RESERVATION_DETAIL,
      }),
    ]);

    await Promise.all([
      reservationsQuery.refetch(),
      statsQuery.refetch(),
      selectedReservationId ? reservationDetailQuery.refetch() : Promise.resolve(),
    ]);
  };

  const runReservationAction = async ({
    action,
    reservationId,
    request,
    fallbackSuccessMessage,
  }: {
    action: ReservationActionType;
    reservationId: number | string;
    request: () => Promise<{ message?: string }>;
    fallbackSuccessMessage: string;
  }) => {
    const nextActionKey = `${action}:${reservationId}`;

    try {
      setActiveActionKey(nextActionKey);
      const response = await request();
      await refreshReservationViews();
      showToast({
        title: response.message || fallbackSuccessMessage,
        icon: 'check',
      });
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '예약 상태 변경에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleConfirmReservation = (reservation: AdminReservationDetail) => {
    openDialog({
      type: 'confirm',
      title: '이 예약을 승인할까요?',
      description: '승인 후 예약 상태가 confirmed로 변경됩니다.',
      primaryActionLabel: '승인',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        await runReservationAction({
          action: 'confirm',
          reservationId: reservation.id,
          request: () => postAdminReservationConfirm(reservation.id),
          fallbackSuccessMessage: '예약이 승인되었습니다.',
        });
      },
    });
  };

  const handleRejectReservation = (reservation: AdminReservationDetail) => {
    const reason = window.prompt(
      '거절 사유를 입력하세요. 비워두면 사유 없이 처리됩니다.',
      reservation.cancellation_reason ?? ''
    );
    if (reason === null) return;

    openDialog({
      type: 'warn',
      title: '이 예약을 거절할까요?',
      description:
        reason.trim().length > 0 ? `사유: ${reason.trim()}` : '사유 없이 예약을 거절합니다.',
      primaryActionLabel: '거절',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        await runReservationAction({
          action: 'reject',
          reservationId: reservation.id,
          request: () => postAdminReservationReject(reservation.id, reason),
          fallbackSuccessMessage: '예약이 거절되었습니다.',
        });
      },
    });
  };

  const handleCancelReservation = (reservation: AdminReservationDetail) => {
    const reason = window.prompt(
      '취소 사유를 입력하세요. 비워두면 사유 없이 처리됩니다.',
      reservation.cancellation_reason ?? ''
    );
    if (reason === null) return;

    openDialog({
      type: 'warn',
      title: '이 예약을 취소할까요?',
      description:
        reason.trim().length > 0 ? `사유: ${reason.trim()}` : '사유 없이 예약을 취소합니다.',
      primaryActionLabel: '취소 처리',
      secondaryActionLabel: '돌아가기',
      onPrimaryAction: async () => {
        await runReservationAction({
          action: 'cancel',
          reservationId: reservation.id,
          request: () => deleteAdminReservation(reservation.id, reason),
          fallbackSuccessMessage: '예약이 취소되었습니다.',
        });
      },
    });
  };

  const handleCompleteReservation = (reservation: AdminReservationDetail) => {
    openDialog({
      type: 'confirm',
      title: '방문 완료로 처리할까요?',
      description: '승인된 예약만 완료 처리할 수 있습니다.',
      primaryActionLabel: '방문 완료',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        await runReservationAction({
          action: 'complete',
          reservationId: reservation.id,
          request: () => postAdminReservationComplete(reservation.id),
          fallbackSuccessMessage: '예약이 방문 완료 처리되었습니다.',
        });
      },
    });
  };

  const handleNoShowReservation = (reservation: AdminReservationDetail) => {
    openDialog({
      type: 'warn',
      title: '노쇼로 처리할까요?',
      description: 'confirmed 또는 방금 완료된 예약만 노쇼 처리할 수 있습니다.',
      primaryActionLabel: '노쇼 처리',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        await runReservationAction({
          action: 'no_show',
          reservationId: reservation.id,
          request: () => postAdminReservationNoShow(reservation.id),
          fallbackSuccessMessage: '예약이 노쇼 처리되었습니다.',
        });
      },
    });
  };

  const handleEditVisitReservation = async (reservation: AdminReservationDetail) => {
    const input = window.prompt(
      '새 방문일시를 입력하세요. 쉼표로 최대 2개까지 입력할 수 있습니다. 예: 2026-03-21 14:00, 2026-03-22 10:30',
      getAvailabilityPromptValue(reservation)
    );

    if (!input) return;

    try {
      const availability_options = parseAvailabilityOptions(input);

      await runReservationAction({
        action: 'edit_visit',
        reservationId: reservation.id,
        request: () =>
          putAdminReservation(reservation.id, {
            availability_options,
          }),
        fallbackSuccessMessage: '예약 일정이 수정되었습니다.',
      });
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '예약 일정 수정에 실패했습니다.',
        icon: 'exclaim',
      });
    }
  };

  const handleReservationAction = (
    action: ReservationActionType,
    reservation: AdminReservationDetail
  ) => {
    if (activeActionKey) return;

    switch (action) {
      case 'confirm':
        handleConfirmReservation(reservation);
        return;
      case 'reject':
        handleRejectReservation(reservation);
        return;
      case 'cancel':
        handleCancelReservation(reservation);
        return;
      case 'complete':
        handleCompleteReservation(reservation);
        return;
      case 'no_show':
        handleNoShowReservation(reservation);
        return;
      case 'edit_visit':
        void handleEditVisitReservation(reservation);
        return;
      default:
        return;
    }
  };

  if (!isReady || !canAccess || reservationsQuery.isLoading) {
    return <Loading title="예약 운영 화면을 준비하는 중입니다." fullHeight />;
  }

  return (
    <div css={page}>
      <AdminPageHeader
        title="예약 관리"
        description="상태별 예약 목록을 조회하고 승인, 거절, 취소, 방문 완료, 노쇼 처리를 수행합니다."
        actions={
          <button
            type="button"
            css={refreshButton}
            onClick={() => {
              void Promise.all([reservationsQuery.refetch(), statsQuery.refetch()]);
            }}
          >
            새로고침
          </button>
        }
      />

      <section css={statsGrid}>
        <AdminStatCard as="div" label="예약 대기" value={stats.request} />
        <AdminStatCard as="div" label="승인" value={stats.confirmed} />
        <AdminStatCard as="div" label="거절" value={stats.rejected} />
        <AdminStatCard as="div" label="방문 완료" value={stats.completed} />
        <AdminStatCard as="div" label="노쇼" value={stats.no_show} />
        <AdminStatCard as="div" label="취소" value={stats.canceled} />
      </section>

      <section css={surface}>
        <div css={toolbar}>
          <div css={filterRow}>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                css={filterButton(statusFilter === option.value)}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <AdminSearchField
            value={keyword}
            onChange={setKeyword}
            placeholder="예약 코드, 업체명, 프로그램명, 이메일 검색"
            containerCss={searchField}
          />
        </div>

        {reservationsQuery.isError ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              예약 목록을 불러오지 못했습니다.
            </Text>
            <Text typo="body10" css={adminEmptyDescription}>
              {normalizeError(reservationsQuery.error).message}
            </Text>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              조건에 맞는 예약이 없습니다.
            </Text>
          </div>
        ) : (
          <div css={splitLayout}>
            <div css={listPane}>
              <div css={sectionLead}>
                <Text typo="subtitle1" css={adminSectionTitle}>
                  예약 목록
                </Text>
                <Text typo="body10" css={adminSectionSubtitle}>
                  총 {filteredReservations.length}건
                </Text>
              </div>

              {filteredReservations.map((reservation) => {
                const isSelected = reservation.id === selectedReservationId;
                return (
                  <button
                    key={reservation.id}
                    type="button"
                    css={reservationCard(isSelected)}
                    onClick={() => setSelectedReservationId(reservation.id)}
                  >
                    <div css={reservationCardHeader}>
                      <Text typo="subtitle1" css={cardTitle}>
                        {reservation.program_name || '프로그램 미지정'}
                      </Text>
                      <span css={statusChip(reservation.status)}>
                        {formatStatus(reservation.status)}
                      </span>
                    </div>
                    <Text typo="body10" css={cardMeta}>
                      {reservation.company_name || '-'}
                    </Text>
                    <Text typo="body11" css={cardMeta}>
                      예약 코드: {reservation.reservation_code || reservation.id}
                    </Text>
                    <Text typo="body11" css={cardMeta}>
                      방문 예정: {reservation.visit_date || '-'} {reservation.visit_time || ''}
                    </Text>
                  </button>
                );
              })}
            </div>

            <div css={detailPane}>
              {reservationDetailQuery.isLoading ? (
                <Loading title="예약 상세를 불러오는 중입니다." />
              ) : reservationDetailQuery.isError ? (
                <div css={detailCard}>
                  <Text typo="body4" css={adminEmptyTitle}>
                    예약 상세를 불러오지 못했습니다.
                  </Text>
                  <Text typo="body10" css={adminEmptyDescription}>
                    {normalizeError(reservationDetailQuery.error).message}
                  </Text>
                </div>
              ) : selectedReservation ? (
                <div css={detailCard}>
                  <div css={detailHeader}>
                    <div css={detailHeaderCopy}>
                      <Text tag="h3" typo="subtitle1" css={adminSectionTitle}>
                        {selectedReservation.program_info?.name || '예약 상세'}
                      </Text>
                      <Text typo="body10" css={adminSectionSubtitle}>
                        예약 코드: {selectedReservation.reservation_code || '-'}
                      </Text>
                    </div>
                    <span css={statusChip(selectedReservation.status)}>
                      {formatStatus(selectedReservation.status)}
                    </span>
                  </div>

                  {availableActions.length > 0 && (
                    <div css={detailActionRow}>
                      {availableActions.map((action) => {
                        const nextActionKey = `${action}:${selectedReservation.id}`;
                        const isActionLoading = activeActionKey === nextActionKey;

                        return (
                          <AdminActionButton
                            key={action}
                            variant={getActionButtonVariant(action)}
                            disabled={!!activeActionKey}
                            onClick={() => handleReservationAction(action, selectedReservation)}
                          >
                            {isActionLoading ? '처리 중...' : ACTION_LABELS[action]}
                          </AdminActionButton>
                        );
                      })}
                    </div>
                  )}

                  <div css={detailGrid}>
                    <DetailField
                      label="업체 ID"
                      value={String(selectedReservation.company_id ?? '-')}
                    />
                    <DetailField
                      label="프로그램 ID"
                      value={String(selectedReservation.program_id ?? '-')}
                    />
                    <DetailField
                      label="고객 이메일"
                      value={selectedReservation.customer_email || '-'}
                    />
                    <DetailField
                      label="연락 방식"
                      value={selectedReservation.preferred_contact || '-'}
                    />
                    <DetailField
                      label="고객 연락처"
                      value={selectedReservation.contact_phone || '-'}
                    />
                    <DetailField
                      label="언어"
                      value={selectedReservation.language_preference || '-'}
                    />
                    <DetailField
                      label="대표 방문일시"
                      value={formatDateTime(selectedReservation.visit_date)}
                    />
                    <DetailField label="통화" value={selectedReservation.currency || '-'} />
                    <DetailField
                      label="생성일"
                      value={formatDateTime(selectedReservation.created_at)}
                    />
                    <DetailField
                      label="수정일"
                      value={formatDateTime(selectedReservation.updated_at)}
                    />
                    <DetailField
                      label="승인일"
                      value={formatDateTime(selectedReservation.confirmed_at)}
                    />
                    <DetailField
                      label="취소일"
                      value={formatDateTime(selectedReservation.cancelled_at)}
                    />
                  </div>

                  <div css={detailSection}>
                    <Text typo="subtitle3" css={adminSectionTitle}>
                      방문 희망 일정
                    </Text>
                    <div css={availabilityList}>
                      {(selectedReservation.availability_options ?? []).length > 0 ? (
                        selectedReservation.availability_options?.map((option) => (
                          <div key={option.date} css={availabilityCard}>
                            <Text typo="body10" css={cardTitle}>
                              {option.date}
                            </Text>
                            <Text typo="body11" css={cardMeta}>
                              {(option.times ?? []).join(', ') || '-'}
                            </Text>
                          </div>
                        ))
                      ) : (
                        <Text typo="body10" css={adminSectionSubtitle}>
                          등록된 일정 정보가 없습니다.
                        </Text>
                      )}
                    </div>
                  </div>

                  <div css={detailSection}>
                    <Text typo="subtitle3" css={adminSectionTitle}>
                      문의사항
                    </Text>
                    <div css={detailTextBox}>
                      <Text typo="body10" css={cardTitle}>
                        {selectedReservation.inquiries || '-'}
                      </Text>
                    </div>
                  </div>

                  <div css={detailSection}>
                    <Text typo="subtitle3" css={adminSectionTitle}>
                      취소/거절 사유
                    </Text>
                    <div css={detailTextBox}>
                      <Text typo="body10" css={cardTitle}>
                        {selectedReservation.cancellation_reason || '-'}
                      </Text>
                    </div>
                  </div>

                  <div css={detailSection}>
                    <Text typo="subtitle3" css={adminSectionTitle}>
                      관리 메모
                    </Text>
                    <div css={detailTextBox}>
                      <Text typo="body10" css={cardTitle}>
                        {selectedReservation.admin_notes || '-'}
                      </Text>
                    </div>
                  </div>
                </div>
              ) : (
                <div css={detailCard}>
                  <Text typo="body4" css={adminEmptyTitle}>
                    예약을 선택해주세요.
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div css={detailField}>
      <Text typo="body12" css={detailFieldLabel}>
        {label}
      </Text>
      <Text typo="body9" css={detailFieldValue}>
        {value}
      </Text>
    </div>
  );
}

const page = adminPage;

const refreshButton = adminGhostButton;

const statsGrid = css`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
const surface = adminConsoleSection;

const toolbar = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const filterRow = adminSegmented;

const filterButton = (selected: boolean) => css`
  ${adminSegmentButton(selected)};
  min-width: 88px;
`;

const searchField = css`
  width: 100%;
  max-width: 360px;
`;

const splitLayout = css`
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 20px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const listPane = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 900px;
  overflow-y: auto;
`;

const sectionLead = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 2px;
`;

const reservationCard = (selected: boolean) => css`
  border: 1px solid ${selected ? 'rgba(132, 155, 130, 0.38)' : adminConsolePalette.borderSoft};
  border-radius: 22px;
  padding: 18px;
  background: ${selected ? 'rgba(132, 155, 130, 0.12)' : 'rgba(14, 22, 35, 0.92)'};
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
`;

const reservationCardHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`;

const cardTitle = css`
  color: ${adminConsolePalette.text};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  word-break: break-word;
`;

const cardMeta = css`
  color: ${adminConsolePalette.textSubtle};
`;

const statusChip = (status?: string | null) => css`
  ${adminCapsuleBadge({
    background:
      status === 'confirmed'
        ? adminConsolePalette.infoSoft
        : status === 'completed'
          ? adminConsolePalette.accentSoft
          : status === 'rejected' || status === 'no_show'
            ? adminConsolePalette.dangerSoft
            : status === 'canceled'
              ? 'rgba(120, 129, 145, 0.16)'
              : adminConsolePalette.warningSoft,
    color:
      status === 'confirmed'
        ? adminConsolePalette.infoText
        : status === 'completed'
          ? adminConsolePalette.accentText
          : status === 'rejected' || status === 'no_show'
            ? adminConsolePalette.dangerText
            : status === 'canceled'
              ? adminConsolePalette.textDim
              : adminConsolePalette.warningText,
    minWidth: 88,
  })};
`;

const detailPane = css`
  min-width: 0;
`;

const detailCard = css`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 24px;
  background: rgba(14, 22, 35, 0.94);
  border: 1px solid ${adminConsolePalette.borderSoft};
  min-height: 320px;
`;

const detailHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const detailHeaderCopy = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const detailActionRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const detailGrid = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const detailField = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const detailFieldLabel = css`
  color: ${adminConsolePalette.textDim};
`;

const detailFieldValue = css`
  color: ${adminConsolePalette.textStrong};
`;

const detailSection = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const availabilityList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const availabilityCard = css`
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const detailTextBox = css`
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;
