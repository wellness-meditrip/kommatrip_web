import { Search } from '@/icons';
import { wrapper, searchBar, input, button } from './index.styles';

interface SearchBarProps {
  onValueChange: (value: string) => void;
}

export default function SearchBar({ onValueChange }: SearchBarProps) {
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
        <input
          type="text"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          css={input}
          placeholder="어떤 클리닉을 찾으시나요?"
        />
        <button type="submit" css={button}>
          <Search width={24} height={24} />
        </button>
      </div>
    </div>
  );
}
