import { Fragment, type ReactNode } from 'react';
import Image from 'next/image';
import { Text } from '@/components';
import { ChevronRight } from '@/icons';
import { BookingDetailRow, BookingDetailSection } from './shared';
import {
  contactTextRow,
  divider,
  infoGroup,
  providerButton,
  providerCard,
  providerImageStyle,
  providerImageWrapper,
  providerInfoWrapper,
  providerTitleRow,
} from './index.styles';

interface BookingDateItem {
  date?: string;
  time?: string;
}

interface BookingInfoSectionProps {
  title: string;
  bookingIdLabel: string;
  bookingId: string;
  dateLabel: string;
  timeLabel: string;
  bookingDates: BookingDateItem[];
}

interface GuestInfoSectionProps {
  title: string;
  nameLabel: string;
  name: string;
  contactLabel: string;
  contactMethodLabel?: string;
  contactValue: string;
  languageLabel: string;
  language: string;
}

interface ProviderInfoSectionProps {
  title: string;
  name: string;
  address: string;
  image: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface PaymentInfoSectionProps {
  title: string;
  paymentMethodLabel: string;
  paymentMethod: string;
  paymentAmountLabel: string;
  paymentAmount: string;
  finalPaymentAmountLabel: string;
  finalPaymentAmount: string;
}

export function BookingInfoSection({
  title,
  bookingIdLabel,
  bookingId,
  dateLabel,
  timeLabel,
  bookingDates,
}: BookingInfoSectionProps) {
  return (
    <BookingDetailSection title={title}>
      <BookingDetailRow label={bookingIdLabel} value={bookingId} />
      {bookingDates.map((item, index) => (
        <Fragment key={`${item.date}-${item.time}-${index}`}>
          <div css={infoGroup}>
            <BookingDetailRow label={dateLabel} value={item.date || '-'} />
            <BookingDetailRow label={timeLabel} value={item.time || '-'} />
          </div>
          {index < bookingDates.length - 1 && <div css={divider} />}
        </Fragment>
      ))}
    </BookingDetailSection>
  );
}

export function GuestInfoSection({
  title,
  nameLabel,
  name,
  contactLabel,
  contactMethodLabel,
  contactValue,
  languageLabel,
  language,
}: GuestInfoSectionProps) {
  const contactValueNode: ReactNode = contactMethodLabel ? (
    <div css={contactTextRow}>
      <Text typo="body_M" color="primary30">
        {contactMethodLabel}
      </Text>
      <Text typo="body_M" color="text_tertiary">
        |
      </Text>
      <Text typo="body_M" color="text_primary">
        {contactValue}
      </Text>
    </div>
  ) : (
    <Text typo="body_M" color="text_primary">
      {contactValue}
    </Text>
  );

  return (
    <BookingDetailSection title={title}>
      <BookingDetailRow label={nameLabel} value={name} />
      <BookingDetailRow label={contactLabel} value={contactValueNode} />
      <BookingDetailRow label={languageLabel} value={language} />
    </BookingDetailSection>
  );
}

export function ProviderInfoSection({
  title,
  name,
  address,
  image,
  disabled = false,
  onClick,
}: ProviderInfoSectionProps) {
  return (
    <BookingDetailSection title={title}>
      <div css={providerCard}>
        <button type="button" css={providerButton} onClick={onClick} disabled={disabled}>
          <div css={providerImageWrapper}>
            <Image src={image} alt={name} fill css={providerImageStyle} />
          </div>
          <div css={providerInfoWrapper}>
            <div css={providerTitleRow}>
              <Text typo="body_M" color="text_primary">
                {name}
              </Text>
              <ChevronRight width={20} height={20} />
            </div>
            <Text typo="body_S" color="text_tertiary">
              {address}
            </Text>
          </div>
        </button>
      </div>
    </BookingDetailSection>
  );
}

export function PaymentInfoSection({
  title,
  paymentMethodLabel,
  paymentMethod,
  paymentAmountLabel,
  paymentAmount,
  finalPaymentAmountLabel,
  finalPaymentAmount,
}: PaymentInfoSectionProps) {
  return (
    <BookingDetailSection title={title}>
      <BookingDetailRow label={paymentMethodLabel} value={paymentMethod} />
      <BookingDetailRow label={paymentAmountLabel} value={paymentAmount} />
      <BookingDetailRow label={finalPaymentAmountLabel} value={finalPaymentAmount} />
    </BookingDetailSection>
  );
}
