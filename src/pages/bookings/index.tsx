import { useEffect, useMemo, useState } from 'react';
import { Layout, GNB, Text, AppBar, Loading, Empty, LoginModal } from '@/components';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { ArrowDown } from '@/icons';
import Image from 'next/image';
import { useGetReservationsQuery } from '@/queries/reservation';
import { useRequireAuth } from '@/hooks';
import { ReservationListItem } from '@/models/reservation';
import { useAuthStore } from '@/store/auth';

type ReservationStatus = 'request' | 'confirmed' | 'canceled' | 'completed';
type FilterStatus = 'total' | 'request' | 'confirmed' | 'canceled' | 'completed';

interface ReservationCard {
  id: number;
  image: string;
  title: string;
  clinicName: string;
  date: string;
  status: ReservationStatus;
  hasReview?: boolean;
}

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'total', label: 'Total' },
  { value: 'request', label: 'Request' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'completed', label: 'Completed' },
];

export default function MyBookingsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('total');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { showLoginModal, setShowLoginModal, isAuthenticated, isLoading, handleDismissModal } =
    useRequireAuth(true);
  const accessToken = useAuthStore((state) => state.accessToken);

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

  const formatReservationDate = (date?: string, time?: string) => {
    if (!date) return '-';
    const dateTime = time ? new Date(`${date}T${time}`) : new Date(date);
    if (Number.isNaN(dateTime.getTime())) return date;
    const dateText = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dateTime);
    const dayText = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateTime);
    if (!time) return `${dateText} (${dayText})`;
    const timeText = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(dateTime);
    return `${dateText} (${dayText}) ${timeText}`;
  };

  const normalizeStatus = (status?: string): ReservationStatus => {
    const value = (status ?? '').toLowerCase();
    if (value.includes('confirm')) return 'confirmed';
    if (value.includes('cancel')) return 'canceled';
    if (value.includes('complete') || value.includes('done')) return 'completed';
    if (value.includes('pending') || value.includes('wait')) return 'request';
    if (value.includes('request')) return 'request';
    return 'request';
  };

  const mapReservation = (reservation: ReservationListItem): ReservationCard => {
    const status = normalizeStatus(reservation.status);
    return {
      id: reservation.id,
      image:
        reservation.program_image_url ||
        reservation.company_primary_image_url ||
        reservation.company_image_url ||
        '/default.png',
      title: reservation.program_name || 'Program',
      clinicName: reservation.company_name || 'Clinic',
      date: formatReservationDate(
        reservation.visit_date || reservation.date,
        reservation.visit_time || reservation.time
      ),
      status,
      hasReview: reservation.has_review ?? reservation.review_written ?? false,
    };
  };

  const reservations = useMemo(() => {
    return (data?.reservations ?? []).map(mapReservation);
  }, [data]);

  const upcomingReservations = reservations.filter((r) => r.status !== 'completed');
  const completedReservations = reservations.filter((r) => r.status === 'completed');

  const getStatusButton = (status: ReservationStatus) => {
    switch (status) {
      case 'request':
        return { text: 'Request', style: requestButton };
      case 'confirmed':
        return { text: 'Confirmed', style: confirmedButton };
      case 'canceled':
        return { text: 'Canceled', style: canceledButton };
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
            <Loading title="Loading..." fullHeight />
          </div>
        )}
        {!isReservationsLoading && reservations.length === 0 && (
          <div css={stateContainer}>
            <Empty title="예약 내역이 없습니다." />
          </div>
        )}
        {/* Upcoming Reservations */}
        {upcomingReservations.map((reservation) => {
          const statusButton = getStatusButton(reservation.status);
          return (
            <div key={reservation.id} css={reservationCard}>
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
                Completed
              </Text>
            </div>

            {completedReservations.map((reservation) => (
              <div key={reservation.id} css={completedCard}>
                <div css={completedBadge}>
                  <Text typo="body_S" color="white">
                    Completed
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
                  <button css={bookAgainButton}>
                    <Text typo="body_M" color="text_secondary">
                      Book Again
                    </Text>
                  </button>
                  {reservation.hasReview ? (
                    <button css={viewReviewButton}>
                      <Text typo="body_M" color="white">
                        View My Review
                      </Text>
                    </button>
                  ) : (
                    <button css={writeReviewButton}>
                      <Text typo="body_M" color="white">
                        Write a Review
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

const bottomSpacer = css`
  height: calc(${theme.size.gnbHeight} + 24px);
`;
