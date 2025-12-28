import { useTranslations } from 'next-intl';
import { Text } from '@/components';
import { Chevron } from '@/icons';
import {
  chevronIcon,
  concernsBox,
  concernsList,
  concernsTitle,
  inquiryTitle,
  sectionCard,
  sectionContent,
  sectionHeader,
  textarea,
} from './index.styles';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  commonConcerns: string[];
  inquiryText: string;
  onInquiryChange: (value: string) => void;
}

export function InquiriesSection({
  isOpen,
  onToggle,
  commonConcerns,
  inquiryText,
  onInquiryChange,
}: Props) {
  const t = useTranslations('reservation');

  return (
    <div css={sectionCard}>
      <div css={sectionHeader} onClick={onToggle}>
        <Text typo="title_M" color="text_primary">
          {t('form.inquiries.title')}
        </Text>
        <div css={chevronIcon(isOpen)}>
          <Chevron width={24} height={24} />
        </div>
      </div>
      {isOpen && (
        <div css={sectionContent}>
          <Text typo="body_M" color="text_primary" css={inquiryTitle}>
            {t('form.inquiries.subtitle')}
          </Text>
          <div css={concernsBox}>
            <Text typo="body_S" color="text_secondary" css={concernsTitle}>
              {t('form.inquiries.concernsTitle')}
            </Text>
            <ul css={concernsList}>
              {commonConcerns.map((concern, index) => (
                <li key={index}>
                  <Text typo="body_S" color="text_secondary">
                    {concern}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
          <textarea
            placeholder={t('form.inquiries.placeholder')}
            value={inquiryText}
            onChange={(e) => onInquiryChange(e.target.value)}
            css={textarea}
          />
        </div>
      )}
    </div>
  );
}
