import { Search } from '@/icons';
import { wrapper, searchBar, input, button } from './index.styles';

interface SearchBarProps {
  onValueChange: (value: string) => void;
  placeholder?: string;
  isLeft?: boolean;
}

export default function SearchBar({ onValueChange, placeholder, isLeft = false }: SearchBarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onValueChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      onValueChange(value);
    }
  };

  return (
    <div css={wrapper}>
      <div css={searchBar}>
        {isLeft && (
          <button type="submit" css={button({ isLeft: true })}>
            <Search width={24} height={24} />
          </button>
        )}
        <input
          type="text"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          css={input}
          placeholder={placeholder}
        />
        {!isLeft && (
          <button type="submit" css={button({ isLeft: false })}>
            <Search width={24} height={24} />
          </button>
        )}
      </div>
    </div>
  );
}
