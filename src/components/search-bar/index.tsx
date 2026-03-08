import { GnbSearchActive } from '@/icons';
import { wrapper, searchBar, input, button } from './index.styles';

interface SearchBarProps {
  value?: string;
  onValueChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  isLeft?: boolean;
  onInputClick?: () => void;
  isReadOnly?: boolean;
}

export function SearchBar({
  value,
  onValueChange,
  onSearch,
  placeholder,
  isLeft = false,
  onInputClick,
  isReadOnly = false,
}: SearchBarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const value = e.target.value;
    onValueChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

  const handleButtonClick = () => {
    onSearch?.();
  };

  return (
    <div css={wrapper}>
      <div css={searchBar}>
        {isLeft && (
          <button type="button" css={button({ isLeft: true })} onClick={handleButtonClick}>
            <GnbSearchActive width={24} height={24} />
          </button>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={onInputClick}
          readOnly={isReadOnly}
          inputMode={isReadOnly ? 'none' : undefined}
          css={input}
          placeholder={placeholder}
        />
        {!isLeft && (
          <button type="button" css={button({ isLeft: false })} onClick={handleButtonClick}>
            <GnbSearchActive width={24} height={24} />
          </button>
        )}
      </div>
    </div>
  );
}
