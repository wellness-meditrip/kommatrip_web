import { Text } from '@/components/text';
import {
  noticeWrapper,
  noticeInfoWrapper,
  noticeTextBlock,
  noticeContent,
  noticeRow,
  titleWrapper,
} from './index.styles';

interface CompanyNoticeProps {
  bookingInformation?: string | null;
  refundRegulation?: string | null;
}

export function CompanyNotice({ bookingInformation, refundRegulation }: CompanyNoticeProps) {
  const hasBookingInfo = !!bookingInformation?.trim();
  const hasRefundRegulation = !!refundRegulation?.trim();
  const formattedBookingInformation = bookingInformation?.replace(/\\n/g, '\n') ?? '';
  const formattedRefundRegulation = refundRegulation?.replace(/\\n/g, '\n') ?? '';

  if (!hasBookingInfo && !hasRefundRegulation) {
    return null;
  }

  return (
    <div css={noticeWrapper}>
      <Text typo="title_M" color="text_primary">
        Notice
      </Text>
      <div css={noticeInfoWrapper}>
        {hasBookingInfo && (
          <div css={noticeRow}>
            <div css={noticeTextBlock}>
              <div css={titleWrapper}>
                <Text typo="title_S" color="text_primary">
                  Booking information
                </Text>
              </div>
              <Text typo="body_M" color="text_secondary" css={noticeContent}>
                {formattedBookingInformation}
              </Text>
            </div>
          </div>
        )}
      </div>
      <div css={noticeInfoWrapper}>
        {hasRefundRegulation && (
          <div css={noticeRow}>
            <div css={noticeTextBlock}>
              <div css={titleWrapper}>
                <Text typo="title_S" color="text_primary">
                  Refund regulation
                </Text>
              </div>
              <Text typo="body_M" color="text_secondary" css={noticeContent}>
                {formattedRefundRegulation}
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
