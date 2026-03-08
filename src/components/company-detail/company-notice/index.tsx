import { Text } from '@/components/text';
import {
  noticeWrapper,
  noticeInfoWrapper,
  noticeTextBlock,
  noticeContent,
  noticeRow,
  titleWrapper,
} from './index.styles';
import { useTranslations } from 'next-intl';

interface CompanyNoticeProps {
  bookingInformation?: string | null;
  refundRegulation?: string | null;
}

export function CompanyNotice({ bookingInformation, refundRegulation }: CompanyNoticeProps) {
  const t = useTranslations('company-detail');
  const formattedBookingInformation = bookingInformation?.replace(/\\n/g, '\n').trim() ?? '';
  const formattedRefundRegulation = refundRegulation?.replace(/\\n/g, '\n').trim() ?? '';

  return (
    <div css={noticeWrapper}>
      <Text typo="title_M" color="text_primary">
        {t('noticeTitle')}
      </Text>
      <div css={noticeInfoWrapper}>
        <div css={noticeRow}>
          <div css={noticeTextBlock}>
            <div css={titleWrapper}>
              <Text typo="title_S" color="text_primary">
                {t('bookingInfo')}
              </Text>
            </div>
            <Text typo="body_M" color="text_secondary" css={noticeContent}>
              {formattedBookingInformation || t('infoPending')}
            </Text>
          </div>
        </div>
      </div>
      <div css={noticeInfoWrapper}>
        <div css={noticeRow}>
          <div css={noticeTextBlock}>
            <div css={titleWrapper}>
              <Text typo="title_S" color="text_primary">
                {t('refundRegulation')}
              </Text>
            </div>
            <Text typo="body_M" color="text_secondary" css={noticeContent}>
              {formattedRefundRegulation || t('infoPending')}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
