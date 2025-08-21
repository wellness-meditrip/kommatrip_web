import { css } from '@emotion/react';
import { theme } from '@/styles';

export const container = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 24px;
`;

export const successSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  padding: 100px 0 32px;
`;

export const checkIconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 8px;
`;

export const successMessage = css`
  margin-bottom: 32px;

  text-align: center;
`;

export const reservationCard = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  width: 100%;
  max-width: 320px;
  padding: 20px;
  border: 1px solid ${theme.colors.primary50};
  border-radius: 12px;

  background-color: ${theme.colors.primary0};
`;

export const clinicName = css`
  margin: 0;

  text-align: center;
`;

export const reservationDateTime = css`
  margin: 0;

  text-align: center;
`;

export const packageName = css`
  margin: 0;

  text-align: center;
`;

export const section = css`
  display: flex;
  flex-direction: column;

  height: 100%;

  background-color: ${theme.colors.bg_default};
`;

export const policyCard = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  margin: 16px 20px;
  padding: 20px;
  border-radius: 12px;

  background-color: ${theme.colors.white};
`;

export const policyTitle = css`
  margin: 0;
`;

export const policyContent = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const policyText = css`
  margin: 0;

  line-height: 1.5;
`;

export const buttonSection = css`
  margin-top: auto;
  padding-bottom: 20px;
`;
