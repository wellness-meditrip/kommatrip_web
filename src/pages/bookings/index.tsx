import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, GNB, Text, AppBar, Loading, Empty, LoginModal } from '@/components';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { ArrowDown } from '@/icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGetReservationsQuery } from '@/queries/reservation';
import { useRequireAuth } from '@/hooks';
import { ReservationListItem } from '@/models/reservation';
import { useAuthStore } from '@/store/auth';
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

export default function MyBookingsPage() {
  const t = useTranslations('mypage.reservations');
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('total');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { showLoginModal, setShowLoginModal, isAuthenticated, handleDismissModal } =
    useRequireAuth(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const locale = currentLocale === 'ko' ? 'ko-KR' : currentLocale === 'ja' ? 'ja-JP' : 'en-US';

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

  const statusParam = selectedFilter === 'total' ? undefined : selectedFilter;
  const { data, isLoading: isReservationsLoading } = useGetReservationsQuery(
    {
      skip: 0,
      limit: 20,
      status: statusParam,
    },
    !!accessToken
  );

  useEffect(() => {
    if (isAuthenticated && !accessToken) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, accessToken, setShowLoginModal]);

  const formatReservationDate = useCallback(
    (date?: string, time?: string) => {
      if (!date) return '-';
      const dateTime = time ? new Date(`${date}T${time}`) : new Date(date);
      if (Number.isNaN(dateTime.getTime())) return date;
      const dateText = new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateTime);
      const dayText = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dateTime);
      if (!time) return `${dateText} (${dayText})`;
      const timeText = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(dateTime);
      return `${dateText} (${dayText}) ${timeText}`;
    },
    [locale]
  );

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

  const upcomingReservations = reservations.filter((r) => r.status !== 'completed');
  const completedReservations = reservations.filter((r) => r.status === 'completed');

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

  if (!isAuthenticated) {
    return (
      <Layout isAppBarExist={false}>
        <AppBar logo="light" backgroundColor="green" />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onCancel={handleDismissModal}
        />
      </Layout>
    );
  }

  if (!accessToken) {
    return (
      <Layout isAppBarExist={false}>
        <AppBar logo="light" backgroundColor="green" />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onCancel={handleDismissModal}
        />
      </Layout>
    );
  }

  return (
    <Layout isAppBarExist={false}>
      <AppBar logo="light" backgroundColor="green" />
      <div css={headerBar}>
        <button css={filterButton} onClick={() => setIsFilterModalOpen(true)}>
          <Text typo="body_M" color="white">
            {filterOptions.find((f) => f.value === selectedFilter)?.label}
          </Text>
          <ArrowDown width={16} height={16} />
        </button>
      </div>

      {/* Content */}
      <div css={contentContainer}>
        {isReservationsLoading && (
          <div css={stateContainer}>
            <Loading title={t('loading')} fullHeight />
          </div>
        )}
        {!isReservationsLoading && reservations.length === 0 && (
          <div css={stateContainer}>
            <Empty title={t('empty')} />
          </div>
        )}
        {/* Upcoming Reservations */}
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
                  <Text typo="title_M" color="text_primary">
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
                    typo="body_M"
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

        {/* Completed Section */}
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
                  <div css={cardInfo}>
                    <Text typo="title_M" color="text_primary">
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

      {/* Filter Modal */}
      {isFilterModalOpen && (
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

      <GNB />
    </Layout>
  );
}

const headerBar = css`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px;
  background: ${theme.colors.primary80};
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

const contentContainer = css`
  padding: 16px;
  padding-bottom: calc(${theme.size.gnbHeight});
  background: ${theme.colors.bg_surface1};
`;

const stateContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - ${theme.size.appBarHeight});
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
`;

const requestButton = css`
  width: 100%;
  padding: 12px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 8px;
  background: ${theme.colors.white};
  transition: all 0.2s ease;
`;

const confirmedButton = css`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${theme.colors.primary50};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const canceledButton = css`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
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
  gap: 12px;
  margin-top: 12px;
`;

const bookAgainButton = css`
  flex: 1;
  padding: 12px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 24px;
  background: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const writeReviewButton = css`
  flex: 1;
  padding: 12px;
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
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 24px;
  background: ${theme.colors.primary50};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const modalOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const modalSheet = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${theme.colors.white};
  border-radius: 24px 24px 0 0;
  padding: 24px;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const modalHandle = css`
  width: 40px;
  height: 4px;
  background: ${theme.colors.gray300};
  border-radius: 2px;
  margin: 0 auto 24px;
`;

const modalList = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const modalItem = css`
  padding: 16px;
  border: none;
  background: none;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.bg_surface1};
  }
`;
