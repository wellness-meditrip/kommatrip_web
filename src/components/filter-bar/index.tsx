/** @jsxImportSource @emotion/react */
import { Text } from '@/components/text';
import { theme } from '@/styles';
import { CATEGORIES } from '@/constants/commons/categories';
import { css } from '@emotion/react';
import { GnbCalendarActive } from '@/icons';

interface FilterBarProps {
  selectedCategories: string[];
  selectedRange?: { start: Date | null; end: Date | null };
  onDateSelect?: () => void;
  onToggleCategory?: (categoryId: string) => void;
  onClearAll: () => void;
}

export function FilterBar({
  selectedCategories,
  selectedRange,
  onDateSelect,
  onToggleCategory,
}: FilterBarProps) {
  const filteredCategories = CATEGORIES.filter((category) => category.id !== 'all-care');

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  const dateText = selectedRange?.start
    ? selectedRange.end
      ? `${formatDate(selectedRange.start)} - ${formatDate(selectedRange.end)}`
      : `${formatDate(selectedRange.start)} -`
    : 'Select dates';

  return (
    <div css={filterContainer}>
      <div css={filterContent}>
        <button css={dateButton} onClick={onDateSelect}>
          <GnbCalendarActive width={16} height={16} />
          <Text typo="button_M" color="primary80">
            {dateText}
          </Text>
        </button>
        <div css={line} />
        {filteredCategories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              css={[filterButton, isSelected && selectedButton]}
              onClick={() => onToggleCategory?.(category.id)}
            >
              {category.icon}
              <Text typo="button_M" color="primary10">
                {category.name}
              </Text>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const filterContainer = css`
  background-color: ${theme.colors.primary80};
  width: 100%;
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary50};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary40};
  }
`;

const filterContent = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  height: 56px;
  white-space: nowrap;
  min-width: fit-content;
`;

const dateButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  height: 32px;
  gap: 6px;
  border-radius: 16px;
  background-color: ${theme.colors.bg_default};
  cursor: pointer;
  flex-shrink: 0;
  /* white-space: nowrap; */
  transition: background-color 0.2s ease;
`;

const line = css`
  width: 1px;
  height: 32px;
  background-color: ${theme.colors.bg_default};
  flex-shrink: 0;
`;

const filterButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  height: 32px;
  gap: 6px;
  border-radius: 16px;
  background-color: ${theme.colors.primary50};
  color: ${theme.colors.primary10};
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${theme.colors.primary10Opacity60};
  }
`;

const selectedButton = css`
  background-color: ${theme.colors.primary10Opacity60};
`;
