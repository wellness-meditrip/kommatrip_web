import { useTranslations } from 'next-intl';
import { Text } from '@/components';
import { Chevron } from '@/icons';
import { css } from '@emotion/react';
import { Skeleton } from '@/components/common/skeleton';
import {
  chevronIcon,
  contactMethodChip,
  contactMethodList,
  fieldGroup,
  input,
  sectionCard,
  sectionContent,
  sectionHeader,
  select,
} from './index.styles';

interface OptionItem {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  contactMethods: OptionItem[];
  selectedContactMethod: string;
  onSelectMethod: (method: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  isEmailReadOnly?: boolean;
  contactPhone: string;
  onPhoneChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  languageOptions: OptionItem[];
}

export function ContactSection({
  isOpen,
  onToggle,
  isLoading = false,
  contactMethods,
  selectedContactMethod,
  onSelectMethod,
  email,
  onEmailChange,
  isEmailReadOnly = false,
  contactPhone,
  onPhoneChange,
  language,
  onLanguageChange,
  languageOptions,
}: Props) {
  const t = useTranslations('reservation');
  const contactPlaceholderMap: Record<string, string> = {
    line: 'Line ID',
    whatsapp: 'WhatsApp Phone Number',
    kakao: 'Kakao ID',
    phone: 'Phone Number',
  };
  const contactPlaceholder =
    contactPlaceholderMap[selectedContactMethod] ?? t('form.contact.contactPlaceholder');

  return (
    <div css={sectionCard}>
      <div css={sectionHeader} onClick={onToggle}>
        <Text typo="title_M" color="text_primary">
          {t('form.contact.title')}
        </Text>
        <div css={chevronIcon(isOpen)}>
          <Chevron width={24} height={24} />
        </div>
      </div>
      {isOpen && (
        <div css={sectionContent}>
          {isLoading ? (
            <div css={skeletonWrapper}>
              <Skeleton width="35%" height={16} />
              <Skeleton width="100%" height={44} radius={10} />
              <Skeleton width="40%" height={16} />
              <div css={skeletonChipRow}>
                <Skeleton width={72} height={32} radius={18} />
                <Skeleton width={92} height={32} radius={18} />
                <Skeleton width={68} height={32} radius={18} />
              </div>
              <Skeleton width="100%" height={44} radius={10} />
              <Skeleton width="35%" height={16} />
              <Skeleton width="100%" height={44} radius={10} />
            </div>
          ) : (
            <>
              <div css={fieldGroup}>
                <Text typo="title_S" color="text_primary">
                  {t('form.contact.email')}
                </Text>
                <input
                  type="email"
                  placeholder={t('form.contact.emailPlaceholder')}
                  value={email}
                  disabled={isEmailReadOnly}
                  aria-disabled={isEmailReadOnly}
                  readOnly={isEmailReadOnly}
                  aria-readonly={isEmailReadOnly}
                  onChange={(e) => onEmailChange(e.target.value)}
                  css={input}
                />
              </div>

              <div css={fieldGroup}>
                <Text typo="title_S" color="text_primary">
                  {t('form.contact.preferredMethod')}
                </Text>
                <div css={contactMethodList}>
                  {contactMethods.map((method) => (
                    <div
                      key={method.value}
                      css={contactMethodChip(selectedContactMethod === method.value)}
                      onClick={() => onSelectMethod(method.value)}
                    >
                      <Text
                        typo="body_S"
                        color={selectedContactMethod === method.value ? 'white' : 'text_secondary'}
                      >
                        {method.label}
                      </Text>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={contactPlaceholder}
                  value={contactPhone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  css={input}
                />
              </div>

              <div css={fieldGroup}>
                <Text typo="title_S" color="text_primary">
                  {t('form.contact.language')}
                </Text>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  css={select}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const skeletonWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const skeletonChipRow = css`
  display: flex;
  gap: 8px;
  margin: 4px 0;
`;
