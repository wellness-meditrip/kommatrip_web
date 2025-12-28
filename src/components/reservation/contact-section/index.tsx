import { Text } from '@/components';
import { Chevron } from '@/icons';
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

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  contactMethods: string[];
  selectedContactMethod: string;
  onSelectMethod: (method: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  contactPhone: string;
  onPhoneChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
}

export function ContactSection({
  isOpen,
  onToggle,
  contactMethods,
  selectedContactMethod,
  onSelectMethod,
  email,
  onEmailChange,
  contactPhone,
  onPhoneChange,
  language,
  onLanguageChange,
}: Props) {
  return (
    <div css={sectionCard}>
      <div css={sectionHeader} onClick={onToggle}>
        <Text typo="title_M" color="text_primary">
          Contact Information
        </Text>
        <div css={chevronIcon(isOpen)}>
          <Chevron width={24} height={24} />
        </div>
      </div>
      {isOpen && (
        <div css={sectionContent}>
          <div css={fieldGroup}>
            <Text typo="body_M" color="text_primary">
              Email
            </Text>
            <input
              type="email"
              placeholder="Elena123@email.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              css={input}
            />
          </div>

          <div css={fieldGroup}>
            <Text typo="body_M" color="text_primary">
              Preferred Contact Method
            </Text>
            <div css={contactMethodList}>
              {contactMethods.map((method) => (
                <div
                  key={method}
                  css={contactMethodChip(selectedContactMethod === method)}
                  onClick={() => onSelectMethod(method)}
                >
                  <Text
                    typo="body_S"
                    color={selectedContactMethod === method ? 'white' : 'text_secondary'}
                  >
                    {method}
                  </Text>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Elena122"
              value={contactPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              css={input}
            />
          </div>

          <div css={fieldGroup}>
            <Text typo="body_M" color="text_primary">
              Language Preference
            </Text>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              css={select}
            >
              <option value="한국어">한국어</option>
              <option value="English">English</option>
              <option value="中文">中文</option>
              <option value="日本語">日本語</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
