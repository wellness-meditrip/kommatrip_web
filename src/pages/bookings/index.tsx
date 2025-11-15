import { useState } from 'react';
import { Layout, GNB, Text, AppBar } from '@/components';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { ArrowDown } from '@/icons';
import Image from 'next/image';

type ReservationStatus = 'request' | 'confirmed' | 'canceled' | 'completed';
type FilterStatus = 'total' | 'request' | 'confirmed' | 'canceled' | 'completed';

interface Reservation {
  id: number;
  image: string;
  title: string;
  clinicName: string;
  date: string;
  status: ReservationStatus;
  hasReview?: boolean;
}

const mockReservations: Reservation[] = [
  {
    id: 1,
    image: '/default.png',
    title: 'Diat Package',
    clinicName: 'Woojooyon Clinic',
    date: 'Oct 21, 2025 (Tue) 10:00 AM',
    status: 'request',
  },
  {
    id: 2,
    image: '/default.png',
    title: 'Diat Package',
    clinicName: 'Woojooyon Clinic',
    date: 'Oct 19, 2025 (Sun) 10:00 AM',
    status: 'canceled',
  },
  {
    id: 3,
    image: '/default.png',
    title: 'Diat Package',
    clinicName: 'Woojooyon Clinic',
    date: 'Oct 15, 2025 (Wed) 10:00 AM',
    status: 'confirmed',
  },
  {
    id: 4,
    image: '/default.png',
    title: 'Diat Package',
    clinicName: 'Woojooyon Clinic',
    date: 'Oct 21, 2025 (Tue) 10:00 AM',
    status: 'completed',
    hasReview: false,
  },
  {
    id: 5,
    image: '/default.png',
    title: 'Diat Package',
    clinicName: 'Woojooyon Clinic',
    date: 'Oct 21, 2025 (Tue) 10:00 AM',
    status: 'completed',
    hasReview: true,
  },
];

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'total', label: 'Total' },
  { value: 'request', label: 'Request' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'completed', label: 'Completed' },
];

export default function MyBookingsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('total');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const filteredReservations = mockReservations.filter((reservation) => {
    if (selectedFilter === 'total') return true;
    return reservation.status === selectedFilter;
  });

  const upcomingReservations = filteredReservations.filter((r) => r.status !== 'completed');
  const completedReservations = filteredReservations.filter((r) => r.status === 'completed');

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

  return (
    <Layout isAppBarExist={false}>
      <AppBar logo="light" backgroundColor="green" />
      <div css={header}>
        <button css={filterButton} onClick={() => setIsFilterModalOpen(true)}>
          <Text typo="body_M" color="white">
            {filterOptions.find((f) => f.value === selectedFilter)?.label}
          </Text>
          <ArrowDown width={16} height={16} />
        </button>
      </div>

      {/* Content */}
      <div css={content}>
        {/* Upcoming Reservations */}
        {upcomingReservations.map((reservation) => {
          const statusButton = getStatusButton(reservation.status);
          return (
            <div key={reservation.id} css={reservationCard}>
              <div css={cardContent}>
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
                <div css={cardContent}>
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
                <div css={completedActions}>
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

            <div css={modalOptions}>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  css={modalOption}
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

const header = css`
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

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg path {
    stroke: white;
  }
`;

const content = css`
  padding: 16px;
  background: ${theme.colors.bg_surface1};
  min-height: calc(100vh - 120px);
  padding-bottom: 80px;
`;

const reservationCard = css`
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const cardContent = css`
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
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

const completedActions = css`
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

const modalTitle = css`
  text-align: center;
  margin-bottom: 24px;
`;

const modalOptions = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const modalOption = css`
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
