/** @jsxImportSource @emotion/react */
import { Text } from '../text';
import { categoryGrid, categoryButton, selectedCategory, categoryName } from './index.styles';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Props {
  categories: readonly Category[];
  selectedCategoryIds: string[];
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryFilter({ categories, selectedCategoryIds, onCategorySelect }: Props) {
  return (
    <div css={categoryGrid}>
      {categories.map((category) => {
        const isSelected = selectedCategoryIds.includes(category.id);
        return (
          <button
            key={category.id}
            css={[categoryButton, isSelected && selectedCategory]}
            onClick={() => onCategorySelect(category.id)}
          >
            <div css={categoryName}>{category.icon}</div>
            <Text typo="body_S" color="primary10">
              {category.name}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
