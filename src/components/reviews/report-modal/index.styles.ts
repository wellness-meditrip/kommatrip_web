import { css } from '@emotion/react';
import { theme } from '@/styles';

export const modalWrapper = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${theme.zIndex.dialog};

  width: calc(100% - 48px);
  max-width: 420px;
  padding: 28px 24px 24px;
  border-radius: 20px;

  background: ${theme.colors.white};
  box-shadow: 0 12px 32px rgb(0 0 0 / 18%);
`;

export const closeButton = css`
  position: absolute;
  top: 16px;
  right: 16px;

  border: none;

  background: transparent;

  cursor: pointer;
`;

export const title = css`
  margin-bottom: 20px;
`;

export const optionList = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const optionRow = css`
  display: flex;
  align-items: center;
  gap: 12px;

  cursor: pointer;
`;

export const radio = css`
  width: 20px;
  height: 20px;
  accent-color: ${theme.colors.primary40};
`;

export const textarea = css`
  width: 100%;
  min-height: 120px;
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.primary10};
  border-radius: 14px;

  color: ${theme.colors.text_secondary};
  font-size: 14px;

  resize: none;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary40};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }
`;

export const submitButton = css`
  width: 100%;
  margin-top: 20px;
  padding: 14px 16px;
  border: none;
  border-radius: 999px;

  background: ${theme.colors.primary40};

  cursor: pointer;

  &:disabled {
    background: ${theme.colors.gray300};

    cursor: not-allowed;
  }
`;
