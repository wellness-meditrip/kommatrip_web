import { css } from '@emotion/react';
import { theme } from '@/styles';

type InputTone = 'default' | 'dark';

export const wrapper = css`
  display: flex;
  flex-direction: column;
  position: relative;

  width: 100%;
`;

export const label = (tone: InputTone = 'default') => css`
  margin-bottom: 9px;

  color: ${tone === 'dark' ? '#eef4ff' : theme.colors.text_primary};
`;

export const inputWrapper = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const input = ({
  errorMessage,
  tone = 'default',
}: {
  errorMessage?: string;
  tone?: InputTone;
}) => css`
  display: flex;
  flex: 1;

  padding: 6px 0 10px 6px;
  border-radius: 0;

  background: transparent;
  color: ${tone === 'dark' ? '#eef4ff' : theme.colors.text_primary};
  text-align: left;

  border-bottom: ${errorMessage
    ? `1px solid ${theme.colors.red200}`
    : tone === 'dark'
      ? '1px solid rgba(148, 165, 184, 0.24)'
      : `1px solid ${theme.colors.gray200}`};

  &:focus {
    border-bottom: 1px solid ${tone === 'dark' ? 'rgba(132, 155, 130, 0.58)' : theme.colors.blue200};
  }

  ${theme.typo.body8};

  &::placeholder {
    color: ${tone === 'dark' ? '#6f7f98' : theme.colors.gray300};
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;

    margin: 0;
  }

  &[type='button'] {
    cursor: pointer;
  }

  &:disabled {
    color: ${tone === 'dark' ? '#6f7f98' : theme.colors.gray300};
  }
  transition: border-bottom 0.2s ease;
`;

export const infoTextWrapper = css`
  padding: 0 2px;
  word-break: break-word;
`;
