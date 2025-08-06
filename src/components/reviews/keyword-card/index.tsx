import { Text } from '@/components';
import { ChipToggleButton } from '@/components/chips';
import { SelectUnfoldActive, SelectUnfoldInactive } from '@/icons';
import { wrapper, keyword, unroll } from './index.styles';

export function KeywordCard({
  tags,
  selectedTags,
  onTagToggle,
  isExpanded,
  toggleExpand,
}: {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
}) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagToggle(tag);
    } else if (selectedTags.length < 5) {
      onTagToggle(tag);
    } else {
      alert('키워드는 최대 5개까지만 선택할 수 있습니다.');
    }
  };

  return (
    <div css={wrapper}>
      <Text typo="subtitle1">어떤 점이 좋았나요?</Text>
      <Text typo="body11" color="gray500">
        이 곳에 어울리는 키워드를 골라주세요(최대 5개)
      </Text>
      <div css={keyword}>
        {tags.map((tag, index) => {
          if (!isExpanded && index >= 3) return null;
          return (
            <ChipToggleButton
              key={tag}
              size="full"
              isSelected={selectedTags.includes(tag)}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </ChipToggleButton>
          );
        })}
        <div css={unroll} onClick={toggleExpand}>
          {isExpanded ? (
            <SelectUnfoldActive width={12} height={6} />
          ) : (
            <SelectUnfoldInactive width={12} height={6} />
          )}
        </div>
      </div>
    </div>
  );
}
