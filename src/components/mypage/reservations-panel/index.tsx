/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from 'react';
import { Text, LoginModal, ReservationCardSkeletonList } from '@/components';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import Image from 'next/image';
import { ArrowDown } from '@/icons';
import { useTranslations } from 'next-intl';
import { useGetReservationsQuery } from '@/queries/reservation';
import { useRequireAuth } from '@/hooks';
import { ReservationListItem } from '@/models/reservation';
import { useCurrentLocale } from '@/i18n/navigation';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';

type ReservationStatus = 'request' | 'confirmed' | 'canceled' | 'completed';
type FilterStatus = 'total' | 'request' | 'confirmed' | 'canceled' | 'completed';

interface ReservationCard {
  id: number;
  image: string;
  title: string;
  clinicName: string;
  companyId?: number;
  providerAddress?: string;
  programId?: number;
  date: string;
  visitDate?: string;
  visitTime?: string;
  status: ReservationStatus;
  hasReview?: boolean;
}

interface Props {
  variant?: 'page' | 'embedded';
}

export function ReservationsPanel({ variant = 'page' }: Props) {
  const t = useTranslations('mypage.reservations');
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('total');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { showLoginModal, setShowLoginModal, isAuthenticated, isLoading, handleDismissModal } =
    useRequireAuth(true);
  const isEmbedded = variant === 'embedded';

  const filterOptions = useMemo<{ value: FilterStatus; label: string }[]>(
    () => [
      { value: 'total', label: t('filters.total') },
      { value: 'request', label: t('filters.request') },
      { value: 'confirmed', label: t('filters.confirmed') },
      { value: 'canceled', label: t('filters.canceled') },
      { value: 'completed', label: t('filters.completed') },
    ],
    [t]
  );

  const { data, isLoading: isReservationsLoading } = useGetReservationsQuery(
    {
      skip: 0,
      limit: 20,
    },
    isAuthenticated
  );

  const formatReservationDate = useCallback((date?: string, time?: string) => {
    if (!date) return '-';
    const dateTime = time ? new Date(`${date}T${time}`) : new Date(date);
    if (Number.isNaN(dateTime.getTime())) return date;
    const hasTimeInDate = /\d{2}:\d{2}/.test(date);
    const shouldShowTime = Boolean(time) || hasTimeInDate;
    const dateText = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dateTime);
    const dayText = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateTime);
    if (!shouldShowTime) return `${dateText} (${dayText})`;
    const timeText = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateTime);
    return `${dateText} (${dayText}) ${timeText}`;
  }, []);

  const normalizeStatus = useCallback((status?: string): ReservationStatus => {
    const value = (status ?? '').toLowerCase();
    if (value.includes('confirm')) return 'confirmed';
    if (value.includes('cancel')) return 'canceled';
    if (value.includes('complete') || value.includes('done')) return 'completed';
    if (value.includes('pending') || value.includes('wait')) return 'request';
    if (value.includes('request')) return 'request';
    return 'request';
  }, []);

  const mapReservation = useCallback(
    (reservation: ReservationListItem): ReservationCard => {
      const status = normalizeStatus(reservation.status);
      return {
        id: reservation.id,
        image:
          reservation.program_image_url || reservation.company_primary_image_url || '/default.png',
        title: reservation.program_name || t('fallback.program'),
        clinicName: reservation.company_name || t('fallback.clinic'),
        companyId: reservation.company_id,
        programId: reservation.program_id,
        providerAddress: reservation.company_address,
        date: formatReservationDate(reservation.visit_date, reservation.visit_time),
        visitDate: reservation.visit_date,
        visitTime: reservation.visit_time,
        status,
        hasReview:
          reservation.can_write_review !== undefined ? !reservation.can_write_review : false,
      };
    },
    [formatReservationDate, normalizeStatus, t]
  );

  const reservations = useMemo(() => {
    return (data?.reservations ?? []).map(mapReservation);
  }, [data, mapReservation]);

  const filteredReservations = useMemo(() => {
    if (selectedFilter === 'total') return reservations;
    return reservations.filter(
      (reservation) => normalizeStatus(reservation.status) === selectedFilter
    );
  }, [normalizeStatus, reservations, selectedFilter]);

  const upcomingReservations = filteredReservations.filter((r) => r.status !== 'completed');
  const completedReservations = filteredReservations.filter((r) => r.status === 'completed');

  const handleReservationClick = useCallback(
    (reservation: ReservationCard) => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          `booking_detail_${reservation.id}`,
          JSON.stringify({
            id: reservation.id,
            status: reservation.status,
            title: reservation.title,
            image: reservation.image,
            clinicName: reservation.clinicName,
            requestDate: reservation.date,
            bookingDates: [
              {
                date: reservation.visitDate,
                time: reservation.visitTime,
              },
            ],
            programId: reservation.programId,
            providerInfo: {
              name: reservation.clinicName,
              address: reservation.providerAddress,
              image: reservation.image,
              id: reservation.companyId,
            },
            hasReview: reservation.hasReview ?? false,
          })
        );
      }
      router.push(`/${currentLocale}${ROUTES.BOOKINGS_DETAIL(reservation.id)}`);
    },
    [currentLocale, router]
  );

  const getStatusButton = (status: ReservationStatus) => {
    switch (status) {
      case 'request':
        return { text: t('status.request'), style: requestButton };
      case 'confirmed':
        return { text: t('status.confirmed'), style: confirmedButton };
      case 'canceled':
        return { text: t('status.canceled'), style: canceledButton };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div css={skeletonContainer}>
        <ReservationCardSkeletonList count={isEmbedded ? 2 : 3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onCancel={handleDismissModal}
      />
    );
  }

  return (
    <>
      {isEmbedded ? (
        <div css={tabBar}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              css={tabButton(option.value === selectedFilter)}
              onClick={() => setSelectedFilter(option.value)}
            >
              <Text
                typo="body_M"
                color={option.value === selectedFilter ? 'primary50' : 'text_secondary'}
              >
                {option.label}
              </Text>
            </button>
          ))}
        </div>
      ) : (
        <div css={headerBar(isEmbedded)}>
          <button css={filterButton} onClick={() => setIsFilterModalOpen(true)}>
            <Text typo="body_M" color="white">
              {filterOptions.find((f) => f.value === selectedFilter)?.label}
            </Text>
            <ArrowDown width={16} height={16} />
          </button>
        </div>
      )}

      <div css={contentContainer(isEmbedded)}>
        {isReservationsLoading && (
          <div css={skeletonContainer}>
            <ReservationCardSkeletonList count={isEmbedded ? 2 : 3} />
          </div>
        )}
        {!isReservationsLoading && filteredReservations.length === 0 && (
          <div css={emptyStateWrap}>
            <div css={emptyStateIcon}>
              <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                <path
                  d="M32 48V28m0 0c0-8.8 8.6-15.9 20-16-1 11.4-8.6 20-20 20Zm0 0c0-7.2-6.5-13-15-13 0 9.9 6.2 18 15 19m-8 10h16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Text typo="title_S" color="text_primary">
              {t('emptyState.title')}
            </Text>
            <Text typo="body_M" color="text_secondary" css={emptyStateSubtitle}>
              {t('emptyState.subtitle')}
            </Text>
            <button
              type="button"
              css={emptyStateButton}
              onClick={() => router.push(`/${currentLocale}${ROUTES.SEARCH}`)}
            >
              <Text typo="button_M" color="white">
                {t('emptyState.cta')}
              </Text>
            </button>
          </div>
        )}
        {upcomingReservations.map((reservation) => {
          const statusButton = getStatusButton(reservation.status);
          return (
            <div
              key={reservation.id}
              css={reservationCard}
              role="button"
              tabIndex={0}
              onClick={() => handleReservationClick(reservation)}
              onKeyDown={(event) => {
                if (event.key === ' ') {
                  event.preventDefault();
                  handleReservationClick(reservation);
                }
                if (event.key === 'Enter') {
                  handleReservationClick(reservation);
                }
              }}
            >
              <div css={cardRow}>
                <Image
                  src={reservation.image}
                  alt={reservation.title}
                  width={80}
                  height={80}
                  css={cardImage}
                />
                <div css={cardInfo}>
                  <Text typo="title_M" color="text_primary" css={cardTitle}>
                    {reservation.title}
                  </Text>
                  <Text typo="body_S" color="text_secondary">
                    {reservation.clinicName}
                  </Text>
                  <Text typo="body_S" color="text_tertiary">
                    {reservation.date}
                  </Text>
                </div>
              </div>
              {statusButton && (
                <button css={statusButton.style} disabled={reservation.status === 'canceled'}>
                  <Text
                    typo="button_XS"
                    color={
                      reservation.status === 'canceled'
                        ? 'text_disabled'
                        : reservation.status === 'confirmed'
                          ? 'white'
                          : 'text_secondary'
                    }
                  >
                    {statusButton.text}
                  </Text>
                </button>
              )}
            </div>
          );
        })}

        {completedReservations.length > 0 && (
          <>
            <div css={sectionTitle}>
              <Text typo="title_L" color="text_primary">
                {t('status.completed')}
              </Text>
            </div>

            {completedReservations.map((reservation) => (
              <div
                key={reservation.id}
                css={completedCard}
                role="button"
                tabIndex={0}
                onClick={() => handleReservationClick(reservation)}
                onKeyDown={(event) => {
                  if (event.key === ' ') {
                    event.preventDefault();
                    handleReservationClick(reservation);
                  }
                  if (event.key === 'Enter') {
                    handleReservationClick(reservation);
                  }
                }}
              >
                <div css={completedBadge}>
                  <Text typo="body_S" color="white">
                    {t('status.completed')}
                  </Text>
                </div>
                <div css={cardRow}>
                  <Image
                    src={reservation.image}
                    alt={reservation.title}
                    width={80}
                    height={80}
                    css={cardImage}
                  />
                  <div css={completedCardInfo}>
                    <Text typo="title_M" color="text_primary" css={cardTitle}>
                      {reservation.title}
                    </Text>
                    <Text typo="body_S" color="text_secondary">
                      {reservation.clinicName}
                    </Text>
                    <Text typo="body_S" color="text_tertiary">
                      {reservation.date}
                    </Text>
                  </div>
                </div>
                <div css={actionRow}>
                  <button
                    css={bookAgainButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!reservation.companyId || !reservation.programId) return;
                      router.push({
                        pathname: `/${currentLocale}${ROUTES.RESERVATIONS}`,
                        query: {
                          companyId: reservation.companyId,
                          programId: reservation.programId,
                        },
                      });
                    }}
                  >
                    <Text typo="body_M" color="text_secondary">
                      {t('bookAgain')}
                    </Text>
                  </button>
                  {reservation.hasReview ? (
                    <button
                      css={viewReviewButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/${currentLocale}${ROUTES.MYPAGE_REVIEWS}`);
                      }}
                    >
                      <Text typo="body_M" color="white">
                        {t('viewReview')}
                      </Text>
                    </button>
                  ) : (
                    <button
                      css={writeReviewButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        const schedule = reservation.date || '-';
                        if (typeof window !== 'undefined') {
                          window.sessionStorage.setItem(
                            'review_draft',
                            JSON.stringify({
                              reservationId: reservation.id,
                              companyId: reservation.companyId,
                              programId: reservation.programId,
                              companyName: reservation.clinicName,
                              programName: reservation.title,
                              schedule,
                              programImage: reservation.image,
                            })
                          );
                        }
                        router.push(`/${currentLocale}${ROUTES.REVIEW}`);
                      }}
                    >
                      <Text typo="body_M" color="white">
                        {t('writeReview')}
                      </Text>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {!isEmbedded && isFilterModalOpen && (
        <>
          <div css={modalOverlay} onClick={() => setIsFilterModalOpen(false)} />
          <div css={modalSheet}>
            <div css={modalHandle} />

            <div css={modalList}>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  css={modalItem}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setIsFilterModalOpen(false);
                  }}
                >
                  <Text
                    typo="title_M"
                    color={selectedFilter === option.value ? 'primary50' : 'text_primary'}
                  >
                    {option.label}
                  </Text>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

const headerBar = (isEmbedded: boolean) => css`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px;
  background: ${theme.colors.primary80};
  border-radius: ${isEmbedded ? '12px' : '0'};
`;

const filterButton = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg path {
    stroke: white;
  }
`;

const tabBar = css`
  display: flex;
  gap: 8px;
  padding: 12px 0 16px;
  flex-wrap: wrap;
`;

const tabButton = (isActive: boolean) => css`
  padding: 8px 12px;
  border-radius: 999px;
  border: ${isActive ? `1px solid ${theme.colors.primary50}` : '1px solid transparent'};
  background: ${isActive ? theme.colors.primary10Opacity40 : theme.colors.bg_surface1};
  cursor: pointer;
`;

const contentContainer = (isEmbedded: boolean) => css`
  padding: ${isEmbedded ? '0' : '16px'};
  padding-bottom: ${isEmbedded
    ? `calc(${theme.size.gnbHeight} + env(safe-area-inset-bottom))`
    : `calc(16px + ${theme.size.gnbHeight} + env(safe-area-inset-bottom))`};
  background: ${isEmbedded ? 'transparent' : theme.colors.bg_surface1};
  min-height: ${isEmbedded ? 'auto' : `calc(100vh - ${theme.size.appBarHeight})`};

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-bottom: ${isEmbedded ? '0' : `calc(16px + ${theme.size.gnbHeight})`};
  }
`;

const skeletonContainer = css`
  width: 100%;
`;

const emptyStateWrap = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  min-height: 320px;
  text-align: center;
  background: ${theme.colors.bg_surface1};
  border-radius: 16px;
`;

const emptyStateIcon = css`
  color: ${theme.colors.primary80};
`;

const emptyStateSubtitle = css`
  white-space: pre-line;
`;

const emptyStateButton = css`
  margin-top: 12px;
  min-width: 220px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  background: ${theme.colors.primary80};
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
`;

const reservationCard = css`
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary50};
    outline-offset: 2px;
  }
`;

const cardRow = css`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: center;
`;

const cardImage = css`
  border-radius: 8px;
  object-fit: cover;
`;

const cardInfo = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const completedCardInfo = css`
  ${cardInfo};
  padding-right: 88px;
`;

const cardTitle = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const requestButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 22px;
  padding: 0 12px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 4px;
  background: ${theme.colors.white};
  transition: all 0.2s ease;
`;

const confirmedButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 22px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: ${theme.colors.primary50};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const canceledButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 22px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: ${theme.colors.gray200};
  cursor: not-allowed;
`;

const sectionTitle = css`
  margin: 32px 0 16px 0;
`;

const completedCard = css`
  position: relative;
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary50};
    outline-offset: 2px;
  }
`;

const completedBadge = css`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: ${theme.colors.primary50Opacity60};
  border-radius: 12px;
`;

const actionRow = css`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
`;

const bookAgainButton = css`
  flex: 0 0 auto;
  min-width: 140px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid ${theme.colors.primary50};
  border-radius: 24px;
  background: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const writeReviewButton = css`
  flex: 0 0 auto;
  min-width: 140px;
  height: 30px;
  padding: 0 12px;
  border: none;
  border-radius: 24px;
  background: ${theme.colors.primary50};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const viewReviewButton = css`
  ${writeReviewButton};
  background: ${theme.colors.primary80};
`;

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: ${theme.zIndex.actionSheet};
`;

const modalSheet = css`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${theme.zIndex.actionSheet + 1};
  padding: 16px 18px 28px;
  border-radius: 24px 24px 0 0;
  background: ${theme.colors.white};
  animation: slide-up 0.25s ease-out;

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }
`;

const modalHandle = css`
  width: 44px;
  height: 4px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: ${theme.colors.gray300};
`;

const modalList = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const modalItem = css`
  padding: 14px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg_surface1};
  }
`;
