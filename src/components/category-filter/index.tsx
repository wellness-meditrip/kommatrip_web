/** @jsxImportSource @emotion/react */
import { Text } from '../text';
import {
  categoryGrid,
  categoryButton,
  selectedCategory,
  categoryName,
  categoryLabel,
} from './index.styles';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  nameKey?: string;
  icon: React.ReactNode;
}

interface Props {
  categories: readonly Category[];
  selectedCategoryIds: string[];
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryFilter({ categories, selectedCategoryIds, onCategorySelect }: Props) {
  const t = useTranslations('categories');
  const allCategoryIds = categories
    .filter((category) => category.id !== 'all-care')
    .map((category) => category.id);
  const isAllSelected =
    allCategoryIds.length > 0 && allCategoryIds.every((id) => selectedCategoryIds.includes(id));
  return (
    <div css={categoryGrid}>
      {categories.map((category) => {
        const isSelected =
          category.id === 'all-care' ? isAllSelected : selectedCategoryIds.includes(category.id);
        return (
          <button
            key={category.id}
            css={[categoryButton, isSelected && selectedCategory]}
            onClick={() => onCategorySelect(category.id)}
          >
            <div css={categoryName}>{category.icon}</div>
            <Text
              typo="body_S"
              color="primary10"
              style={{
                whiteSpace: 'normal',
              }}
              css={categoryLabel}
            >
              {category.nameKey ? t(category.nameKey) : category.name}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
