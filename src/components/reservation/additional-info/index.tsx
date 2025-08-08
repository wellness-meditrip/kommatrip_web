import { Text } from '@/components';
import { wrapper, textareaContainer, textarea, textCount } from './index.styles';

interface AdditionalInfoCardProps {
  additionalInfo: string;
  setAdditionalInfo: (text: string) => void;
}

export function AdditionalInfoCard({ additionalInfo, setAdditionalInfo }: AdditionalInfoCardProps) {
  return (
    <div css={wrapper}>
      <Text typo="title_M" color="text_primary">
        기타 정보
      </Text>

      <div css={textareaContainer}>
        <Text typo="title_S" color="text_primary">
          문의사항
        </Text>
        <textarea
          css={textarea}
          placeholder="남기고 싶은 문의사항이 있다면 작성해주세요"
          maxLength={500}
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        />
        <div css={textCount}>
          <span>{additionalInfo.length} / 400</span>
        </div>
      </div>
    </div>
  );
}
