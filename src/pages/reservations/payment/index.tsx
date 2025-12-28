import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { AppBar, CTAButton, Empty, Layout, Text, CompanyInfoCard } from '@/components';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';
import { usePostCreateReservationMutation } from '@/queries/reservation';
import { useToast } from '@/hooks';
import { useCurrentLocale } from '@/i18n/navigation';
import { Dim } from '@/components/dim';
import { PaymentLocation } from '@/icons';

interface ReservationDraft {
  company_id: number;
  company_name: string;
  company_address: string;
  company_tags: string[];
  program_id: number;
  program_name: string;
  program_duration_minutes: number;
  program_price: number;
  preferred_contact: string;
  language_preference: string;
  availability_options: Array<{
    date: string;
    times: string[];
  }>;
  inquiries: string;
  contact_line: string;
  contact_whatsapp: string;
  contact_kakao: string;
  contact_phone: string;
}

const formatDateDisplay = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${year}.${month}.${day}`;
};

const formatTimeDisplay = (timeString: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

export default function ReservationPaymentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const currentLocale = useCurrentLocale();
  const [draft, setDraft] = useState<ReservationDraft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: createReservation, isPending } = usePostCreateReservationMutation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('reservation_draft');
    if (!stored) return;
    try {
      setDraft(JSON.parse(stored));
    } catch {
      window.sessionStorage.removeItem('reservation_draft');
    }
  }, []);

  const primaryOption = useMemo(() => {
    if (!draft?.availability_options?.length) return null;
    const [first] = draft.availability_options;
    if (!first) return null;
    const [firstTime] = first.times ?? [];
    return { date: first.date, time: firstTime ?? '' };
  }, [draft]);

  const handleSubmit = async () => {
    if (!draft) {
      showToast({ title: '예약 정보를 찾을 수 없습니다.', icon: 'exclaim' });
      return;
    }

    try {
      await createReservation({
        program_id: draft.program_id,
        preferred_contact: draft.preferred_contact,
        language_preference: draft.language_preference as
          | 'korean'
          | 'english'
          | 'chinese'
          | 'japanese',
        availability_options: draft.availability_options,
        inquiries: draft.inquiries,
        contact_line: draft.contact_line,
        contact_whatsapp: draft.contact_whatsapp,
        contact_kakao: draft.contact_kakao,
        contact_phone: draft.contact_phone,
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'reservation_complete',
          JSON.stringify({
            company_name: draft.company_name,
            program_name: draft.program_name,
            program_duration_minutes: draft.program_duration_minutes,
            date: primaryOption?.date ?? '',
            time: primaryOption?.time ?? '',
          })
        );
      }

      router.push(`/${currentLocale}${ROUTES.RESERVATIONS_COMPLETE}`);
    } catch {
      showToast({ title: '예약 요청에 실패했습니다. 다시 시도해 주세요.', icon: 'exclaim' });
    }
  };

  if (!draft) {
    return (
      <Layout isAppBarExist={false}>
        <AppBar
          onBackClick={router.back}
          leftButton={true}
          buttonType="dark"
          title="Payment"
          backgroundColor="bg_surface1"
        />
        <div css={emptyContainer}>
          <Empty title="결제 정보를 찾을 수 없습니다." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        buttonType="dark"
        title="Payment"
        backgroundColor="bg_surface1"
      />
      <div css={pageWrapper}>
        <CompanyInfoCard
          name={draft.company_name}
          address={draft.company_address}
          tags={draft.company_tags}
          addressIconNode={<PaymentLocation width={16} height={16} />}
          variant="payment"
        />

        <div css={infoCard}>
          <Text typo="title_M" color="text_primary">
            Booking Info
          </Text>
          <div css={infoRow}>
            <Text typo="body_M" color="text_secondary">
              Date
            </Text>
            <Text typo="body_M" color="text_primary">
              {primaryOption ? formatDateDisplay(primaryOption.date) : '-'}
            </Text>
          </div>
          <div css={infoRow}>
            <Text typo="body_M" color="text_secondary">
              Time
            </Text>
            <Text typo="body_M" color="text_primary">
              {primaryOption ? formatTimeDisplay(primaryOption.time) : '-'}
            </Text>
          </div>
          <div css={infoRow}>
            <Text typo="body_M" color="text_secondary">
              Program
            </Text>
            <Text typo="body_M" color="text_primary" css={programText}>
              {draft.program_name} ({draft.program_duration_minutes}min)
            </Text>
          </div>
        </div>

        <div css={infoCard}>
          <Text typo="title_M" color="text_primary">
            Payment Method
          </Text>
          <div css={paymentMethod}>
            <div css={radioSelected} />
            <Text typo="body_M" color="text_primary">
              Pay on site
            </Text>
          </div>
        </div>

        <div css={infoCard}>
          <Text typo="title_M" color="text_primary">
            Payment Amount
          </Text>
          <div css={amountRow}>
            <Text typo="body_M" color="text_secondary">
              Payment Amount
            </Text>
            <Text typo="body_M" color="text_primary">
              {formatPrice(draft.program_price)} KRW
            </Text>
          </div>
          <div css={divider} />
          <div css={amountRow}>
            <Text typo="body_M" color="text_primary">
              Final Payment Amount
            </Text>
            <Text typo="title_S" color="primary50">
              {formatPrice(draft.program_price)} KRW
            </Text>
          </div>
        </div>
      </div>

      <div css={actionBar}>
        <CTAButton onClick={() => setIsModalOpen(true)} disabled={isPending}>
          Book Now
        </CTAButton>
      </div>

      {isModalOpen && (
        <>
          <Dim fullScreen onClick={() => setIsModalOpen(false)} />
          <div css={modalCard}>
            <div css={modalText}>
              <Text typo="title_M" color="text_primary">
                Submit Your Reservation?
              </Text>
              <Text typo="body_M" color="text_tertiary" css={modalDescription}>
                Please make sure your reservation details are correct. Once submitted, the request
                will be sent to the provider.
              </Text>
            </div>
            <div css={modalButtonRow}>
              <button css={modalCancel} onClick={() => setIsModalOpen(false)}>
                <Text typo="body_M" color="text_primary">
                  Cancel
                </Text>
              </button>
              <button css={modalSubmit} onClick={handleSubmit}>
                <Text typo="body_M" color="white">
                  Submit
                </Text>
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

const pageWrapper = css`
  padding: 0 0 120px 0;
  background: ${theme.colors.bg_surface1};
`;

const infoCard = css`
  background: ${theme.colors.white};
  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const infoRow = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const programText = css`
  text-align: right;
`;

const paymentMethod = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const radioSelected = css`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.primary50};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${theme.colors.primary50};
    transform: translate(-50%, -50%);
  }
`;

const amountRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const divider = css`
  height: 1px;
  background: ${theme.colors.border_default};
`;

const actionBar = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  background: ${theme.colors.white};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const modalCard = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${theme.colors.white};
  border-radius: 24px;
  width: calc(100% - 48px);
  max-width: 320px;
  padding: 28px 24px 24px;
  z-index: ${theme.zIndex.dialog};
  text-align: center;
  box-shadow: 0 16px 32px ${theme.colors.grayOpacity200};
`;

const modalText = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const modalDescription = css`
  margin: 0;
  line-height: 1.5;
`;

const modalButtonRow = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const modalButtonBase = css`
  border-radius: 999px;
  padding: 12px 0;
  border: 1px solid ${theme.colors.primary50};
  background: ${theme.colors.white};
  cursor: pointer;
`;

const modalCancel = css`
  ${modalButtonBase};
`;

const modalSubmit = css`
  ${modalButtonBase};
  background: ${theme.colors.primary50};
`;

const emptyContainer = css`
  padding: 40px 16px;
`;
