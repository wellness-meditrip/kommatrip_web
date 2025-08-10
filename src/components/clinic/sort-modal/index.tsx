import { Text } from '@/components/text';
import { theme } from '@/styles';
import { css } from '@emotion/react';

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

const overlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  max-width: 480px;
  margin: 0 auto;
`;

const modal = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${theme.colors.white};
  border-radius: 20px 20px 0 0;
  z-index: 1001;
  padding: 16px 20px 32px;
  margin: 0 auto;
  max-width: 480px;
  width: 100%;
`;

const handle = css`
  width: 40px;
  height: 4px;
  background-color: ${theme.colors.gray300};
  border-radius: 2px;
  margin: 0 auto 24px;
`;

const content = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const sortOption = (isSelected: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.gray100};
  }
`;
