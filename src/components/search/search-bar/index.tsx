import { theme } from '@/styles';
import { Search } from '@/icons';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

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

const wrapper = css`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: ${theme.zIndex.searchBar};
  position: fixed;
  top: 52px;

  background-color: ${theme.colors.white};
  max-width: ${theme.size.maxWidth};
  width: 100%;
  height: 80px;
  padding: 16px 20px;
`;
const searchBar = css`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  border-radius: 20px;
  border: 1px solid ${theme.colors.bg_default};

  background: ${theme.colors.primary0};
`;
const input = css`
  width: 100%;

  font-size: ${theme.typo.body_M};
  text-align: left;
  ::placeholder {
    color: ${theme.colors.text_tertiary};
  }
`;

const button = css`
  width: 24px;
  height: 24px;
  margin: 0 8px 0 0;
`;
