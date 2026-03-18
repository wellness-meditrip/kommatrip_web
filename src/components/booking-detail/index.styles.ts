import { css } from '@emotion/react';
import { theme } from '@/styles';

export const card = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 16px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
`;

export const sectionBody = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const infoGroup = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const infoRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const contactTextRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const divider = css`
  height: 1px;

  background: ${theme.colors.border_default};
`;

export const providerCard = css`
  padding: 12px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 12px;

  background: ${theme.colors.bg_surface2};
`;

export const providerButton = css`
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  padding: 0;
  border: none;

  background: transparent;
  text-align: left;

  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`;

export const providerImageWrapper = css`
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  width: 56px;
  height: 56px;
  border-radius: 12px;
`;

export const providerImageStyle = css`
  object-fit: cover;
`;

export const providerInfoWrapper = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
`;

export const providerTitleRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const actionBar = (hasGnb: boolean) => css`
  position: fixed;
  right: 0;
  bottom: ${hasGnb ? theme.size.gnbHeight : '0'};
  left: 0;

  padding: 16px 18px 24px;
`;

export const ctaRow = (count: number) => css`
  display: grid;
  gap: 12px;
  grid-template-columns: ${count > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr'};
`;

export const ctaPrimaryButton = css`
  padding: 16px 0;
  border: none;
  border-radius: 28px;

  background: ${theme.colors.primary50};

  transition: opacity 0.2s ease;

  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;

    cursor: default;
  }
`;

export const ctaSecondaryButton = css`
  padding: 16px 0;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 28px;

  background: ${theme.colors.white};

  transition: border-color 0.2s ease;

  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary50};
  }

  &:disabled {
    opacity: 0.5;

    cursor: default;
  }
`;
