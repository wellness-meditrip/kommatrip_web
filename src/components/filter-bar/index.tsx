/** @jsxImportSource @emotion/react */
import { Text } from '@/components/text';
import { theme } from '@/styles';
import { CATEGORIES } from '@/constants/commons/categories';
import { css } from '@emotion/react';
import { GnbCalendarActive } from '@/icons';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface FilterBarProps {
  selectedCategories: string[];
  selectedRange?: { start: Date | null; end: Date | null };
  onDateSelect?: () => void;
  onToggleCategory?: (categoryId: string) => void;
  onClearAll: () => void;
  variant?: 'default' | 'light';
  showDate?: boolean;
  layout?: 'inline' | 'stacked';
  categories?: { id: string; name: string; nameKey?: string; icon: ReactNode }[];
  centered?: boolean;
}

export function FilterBar({
  selectedCategories,
  selectedRange,
  onDateSelect,
  onToggleCategory,
  onClearAll,
  variant = 'default',
  showDate = true,
  layout = 'inline',
  categories,
  centered = false,
}: FilterBarProps) {
  const t = useTranslations('categories');
  const filteredCategories =
    categories ?? CATEGORIES.filter((category) => category.id !== 'all-care');
  const allCategoryIds = filteredCategories
    .filter((category) => category.id !== 'all-care')
    .map((category) => category.id);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${month}.${day}(${weekday})`;
  };

  const dateText = selectedRange?.start
    ? selectedRange.end
      ? `${formatDate(selectedRange.start)} - ${formatDate(selectedRange.end)}`
      : `${formatDate(selectedRange.start)}`
    : 'Select dates';

  return (
    <div css={filterContainer({ variant, centered })}>
      <div css={filterContent({ layout })}>
        {showDate && (
          <>
            <button css={dateButton({ variant })} onClick={onDateSelect}>
              <GnbCalendarActive width={16} height={16} />
              <Text typo="body_M" color="primary50">
                {dateText}
              </Text>
            </button>
            <div css={line({ variant })} />
          </>
        )}
        {filteredCategories.map((category) => {
          const isAllCategory = category.id === 'all-care';
          const isAllSelected =
            allCategoryIds.length > 0 && selectedCategories.length === allCategoryIds.length;
          const isSelected = isAllCategory
            ? isAllSelected
            : selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              css={[
                filterButton({ variant, layout }),
                isSelected && selectedButton({ variant, layout }),
              ]}
              onClick={() => {
                onToggleCategory?.(category.id);
              }}
            >
              <span css={iconWrapper({ layout })}>{category.icon}</span>
              <Text
                typo={layout === 'stacked' ? 'body_M' : 'button_M'}
                color={variant === 'light' ? 'primary50' : 'primary10'}
              >
                {category.nameKey ? t(category.nameKey) : category.name}
              </Text>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const filterContainer = ({
  variant,
  centered,
}: {
  variant: 'default' | 'light';
  centered: boolean;
}) => css`
  position: sticky;
  top: 0;
  background-color: ${variant === 'light' ? 'transparent' : theme.colors.primary80};
  width: ${centered ? 'fit-content' : '100%'};
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
  ${centered ? 'margin: 0 auto;' : ''}

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

  @media (min-width: ${theme.breakpoints.desktop}) {
    position: static;
    top: auto;
  }
`;

const filterContent = ({ layout }: { layout: 'inline' | 'stacked' }) => css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${layout === 'stacked' ? '0' : '12px 20px'};
  height: ${layout === 'stacked' ? 'auto' : '56px'};
  white-space: nowrap;
  min-width: fit-content;
`;

const dateButton = ({ variant }: { variant: 'default' | 'light' }) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  height: 32px;
  gap: 6px;
  border-radius: 16px;
  background-color: ${variant === 'light' ? theme.colors.bg_surface1 : theme.colors.bg_default};
  border: ${variant === 'light' ? `1px solid ${theme.colors.border_default}` : 'none'};
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
`;

const line = ({ variant }: { variant: 'default' | 'light' }) => css`
  width: 1px;
  height: 32px;
  background-color: ${variant === 'light' ? theme.colors.border_default : theme.colors.bg_default};
  flex-shrink: 0;
`;

const filterButton = ({
  variant,
  layout,
}: {
  variant: 'default' | 'light';
  layout: 'inline' | 'stacked';
}) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${layout === 'stacked' ? 'column' : 'row'};
  padding: ${layout === 'stacked' ? '8px 10px' : '6px 12px'};
  height: ${layout === 'stacked' ? 'auto' : '32px'};
  gap: 6px;
  border-radius: ${layout === 'stacked' ? '12px' : '16px'};
  background-color: ${variant === 'light' ? theme.colors.white : theme.colors.primary50};
  color: ${variant === 'light' ? theme.colors.text_primary : theme.colors.primary10};
  border: ${variant === 'light' ? `1px solid ${theme.colors.border_default}` : 'none'};
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  /* &:hover {
    background-color: ${variant === 'light' ? theme.colors.white : theme.colors.primary50};
  } */

  @media (min-width: ${theme.breakpoints.desktop}) {
    ${layout === 'stacked'
      ? `
    width: 120px;
    height: 88px;
    padding: 10px 8px;
    white-space: normal;
    `
      : ''}
  }
`;

const selectedButton = ({
  variant,
  layout,
}: {
  variant: 'default' | 'light';
  layout: 'inline' | 'stacked';
}) => css`
  background-color: ${theme.colors.primary10Opacity60};
  border-color: ${variant === 'light' ? theme.colors.border_default : 'transparent'};
`;

const iconWrapper = ({ layout }: { layout: 'inline' | 'stacked' }) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${layout === 'stacked' ? '20px' : '16px'};
`;
