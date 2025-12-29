import { Text } from '@/components';
import { ChipToggleButton } from '@/components/chips';
import { SelectUnfoldActive, SelectUnfoldInactive } from '@/icons';
import { wrapper, keyword, unroll } from './index.styles';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('review');
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagToggle(tag);
    } else if (selectedTags.length < MAX_SELECTABLE_TAGS) {
      onTagToggle(tag);
    } else {
      alert(t('keywords.maxAlert'));
    }
  };

  const visibleTags = isExpanded ? tags : tags.slice(0, MAX_VISIBLE_TAGS);

  return (
    <div css={wrapper}>
      <Text typo="subtitle1">{t('keywords.title')}</Text>
      <Text typo="body11" color="gray500">
        {t('keywords.subtitle')}
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
