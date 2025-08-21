import { Text } from '@/components/text';
import { overlay, modal, handle, content, sortOption } from './index.styles';

interface SortOption {
  id: string;
  label: string;
}

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: string;
  onSortChange: (sortId: string) => void;
}

const sortOptions: SortOption[] = [
  { id: 'rating_high', label: '별점 높은 순' },
  { id: 'rating_low', label: '별점 낮은 순' },
  { id: 'review_count', label: '리뷰 많은 순' },
];

export function SortModal({ isOpen, onClose, selectedSort, onSortChange }: SortModalProps) {
  if (!isOpen) return null;

  const handleSortClick = (sortId: string) => {
    onSortChange(sortId);
    onClose();
  };

  return (
    <>
      <div css={overlay} onClick={onClose} />
      <div css={modal}>
        <div css={handle} />
        <div css={content}>
          {sortOptions.map((option) => (
            <button
              key={option.id}
              css={sortOption(option.id === selectedSort)}
              onClick={() => handleSortClick(option.id)}
            >
              <Text typo="body_M" color={option.id === selectedSort ? 'primary50' : 'text_primary'}>
                {option.label}
              </Text>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
