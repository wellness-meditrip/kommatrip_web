import { theme } from '@/styles';
import { css } from '@emotion/react';

export const pageWrapper = css`
  display: flex;
  flex-direction: column;

  background-color: ${theme.colors.bg_surface1};
`;

export const contentContainer = css`
  display: flex;
  flex-direction: column;
  gap: 18px;

  min-height: calc(100vh - ${theme.size.gnbHeight});
  padding: 16px 18px 18px;
`;

export const loadingContainer = css`
  display: flex;
  flex-direction: column;
  flex: 1;

  min-height: calc(100vh - 120px);
`;

export const submitButtonContainer = css`
  margin-top: 14px;
  padding: 18px;
`;

export const programInfoCard = css`
  padding: 16px;
  border-radius: 18px;

  background-color: ${theme.colors.white};
  box-shadow: 0 6px 16px rgb(0 0 0 / 6%);
`;

export const programInfoRow = css`
  display: flex;
  gap: 14px;
`;

export const programImageWrapper = css`
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  width: 72px;
  height: 72px;
  border: 1px solid ${theme.colors.gray200};
  border-radius: 14px;
`;

export const programImage = css`
  object-fit: cover;
`;

export const programInfoCol = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const programInfoMetaGroup = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const programInfoMetaRow = css`
  display: flex;
  gap: 10px;
`;

export const keywordCard = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 18px;
  border-radius: 24px;

  background-color: ${theme.colors.white};
  box-shadow: 0 6px 16px rgb(0 0 0 / 6%);
`;

export const keywordHeaderGroup = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const keywordTitleRow = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const keywordGroup = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const tagList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const tagChip = (isSelected: boolean) => css`
  padding: 8px 14px;
  border: 1px solid ${isSelected ? theme.colors.primary40 : theme.colors.gray200};
  border-radius: 999px;

  background-color: ${isSelected ? theme.colors.primary10 : theme.colors.white};

  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
`;

export const requiredMark = css`
  color: ${theme.colors.red200};
  ${theme.typo.body_S};
  font-weight: 600;
`;

export const aiConsentCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 18px;
  border-radius: 24px;

  background-color: ${theme.colors.white};
  box-shadow: 0 6px 16px rgb(0 0 0 / 6%);
`;

export const aiConsentHeaderRow = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const aiConsentDescription = css`
  line-height: 1.4;
`;

export const aiConsentRow = css`
  display: flex;
  align-items: center;
  gap: 10px;

  cursor: pointer;
`;

export const aiConsentCheckbox = css`
  width: 18px;
  height: 18px;
  accent-color: ${theme.colors.primary50};

  cursor: pointer;
`;

export const aiConsentLabel = css`
  flex: 1;
`;
