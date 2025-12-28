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
  return (
    <div css={sectionCard}>
      <div css={sectionHeader} onClick={onToggle}>
        <Text typo="title_M" color="text_primary">
          Inquiries
        </Text>
        <div css={chevronIcon(isOpen)}>
          <Chevron width={24} height={24} />
        </div>
      </div>
      {isOpen && (
        <div css={sectionContent}>
          <Text typo="body_M" color="text_primary" css={inquiryTitle}>
            Tell us about your needs (Optional)
          </Text>
          <div css={concernsBox}>
            <Text typo="body_S" color="text_secondary" css={concernsTitle}>
              Common concerns for international visitors :
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
            placeholder="Write about your needs"
            value={inquiryText}
            onChange={(e) => onInquiryChange(e.target.value)}
            css={textarea}
          />
        </div>
      )}
    </div>
  );
}
