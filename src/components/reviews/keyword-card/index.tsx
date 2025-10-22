import { Text } from '@/components';
import { ChipToggleButton } from '@/components/chips';
import { SelectUnfoldActive, SelectUnfoldInactive } from '@/icons';
import { wrapper, keyword, unroll } from './index.styles';

interface KeywordCardProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
}

const MAX_VISIBLE_TAGS = 3;
const MAX_SELECTABLE_TAGS = 5;

export function KeywordCard({
  tags,
  selectedTags,
  onTagToggle,
  isExpanded,
  toggleExpand,
}: KeywordCardProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagToggle(tag);
    } else if (selectedTags.length < MAX_SELECTABLE_TAGS) {
      onTagToggle(tag);
    } else {
      alert('키워드는 최대 5개까지만 선택할 수 있습니다.');
    }
  };

  const visibleTags = isExpanded ? tags : tags.slice(0, MAX_VISIBLE_TAGS);

  return (
    <div css={wrapper}>
      <Text typo="subtitle1">어떤 점이 좋았나요?</Text>
      <Text typo="body11" color="gray500">
        이 곳에 어울리는 키워드를 골라주세요(최대 5개)
      </Text>
      <div css={keyword}>
        {visibleTags.map((tag) => (
          <ChipToggleButton
            key={tag}
            size="full"
            isSelected={selectedTags.includes(tag)}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </ChipToggleButton>
        ))}
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
