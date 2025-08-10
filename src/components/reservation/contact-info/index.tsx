import { Text } from '@/components';
import {
  wrapper,
  inputContainer,
  input,
  nameInputContainer,
  selectContainer,
  select,
} from './index.styles';

interface ContactInfoCardProps {
  email: string;
  setEmail: (email: string) => void;

  contactPhone: string;
  setContactPhone: (phone: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

export function ContactInfoCard({
  email,
  setEmail,
  contactPhone,
  setContactPhone,
  language,
  setLanguage,
}: ContactInfoCardProps) {
  return (
    <div css={wrapper}>
      <Text typo="title_M" color="text_primary">
        연락처 정보
      </Text>

      <div css={inputContainer}>
        <Text typo="title_S" color="text_primary">
          이메일 주소 *
        </Text>
        <input
          css={input}
          type="email"
          placeholder="Elena122@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div css={inputContainer}>
        <Text typo="title_S" color="text_primary">
          연락 가능한 수단 *
        </Text>
        <div css={nameInputContainer}>
          <input
            css={input}
            placeholder="010-1234-5678"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <div css={inputContainer}>
        <Text typo="title_S" color="text_primary">
          통역 필요 언어
        </Text>
        <div css={selectContainer}>
          <select css={select} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="한국어">한국어</option>
            <option value="English">English</option>
            <option value="中文">中文</option>
            <option value="日本語">日本語</option>
          </select>
        </div>
      </div>
    </div>
  );
}
