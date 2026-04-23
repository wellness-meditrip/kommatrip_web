import { css } from '@emotion/react';
import { theme } from '@/styles';

export const container = css`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: scroll;

  width: 100%;
  height: 100%;
  padding: 0 0 30px;
`;

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  padding: 24px 24px 12px;
  align-self: stretch;
`;

export const infoWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  padding: 20px 22px;
  border-radius: 12px;

  background-color: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
  align-self: stretch;
`;

export const titleWrapper = css`
  margin: 0 0 12px;
`;

export const operatingWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 6px;

  padding-top: 6px;
`;

export const urlWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding-top: 8px;
`;

export const contents = css`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 24px 20px;
`;

export const itemWrapper = css`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

export const item = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const textWrapper = css`
  white-space: nowrap;
`;

export const hoursWrapper = css`
  display: flex;
  align-items: flex-start;
  gap: 8px;

  width: 100%;
`;

export const hoursIcon = css`
  flex-shrink: 0;

  margin-top: 2px;
`;

export const hoursContent = css`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const hoursHeader = (isOpen: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: ${isOpen ? '8px' : 0};

  cursor: pointer;
`;

export const hoursHeaderLeft = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const hoursArrow = (isOpen: boolean) => css`
  transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};

  transition: transform 0.2s ease;
`;

export const hoursDetailWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const hoursDetailRow = css`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const dayLabel = css`
  min-width: 40px;
`;

export const recognitionContent = css`
  line-height: 1.3;
  white-space: pre-wrap;
`;

export const recognitionHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  cursor: pointer;
`;

export const contactList = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const contactRow = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

export const contactLabel = css`
  min-width: 84px;
`;

export const facilityIcon = css`
  display: inline-flex;

  svg path,
  svg circle,
  svg rect {
    stroke: ${theme.colors.primary30};
  }
`;

export const theGateSpaArticle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;

  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 28px 24px 16px;

  background: ${theme.colors.white};
  box-sizing: border-box;
`;

export const theGateSpaHeader = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const theGateSpaKicker = css`
  margin: 0;

  line-height: 1.4;
`;

export const theGateSpaTitle = css`
  margin: 0;

  line-height: 1.45;
`;

export const theGateSpaHeroImage = css`
  display: block;

  width: 100%;
  aspect-ratio: 3 / 2;

  border-radius: 6px;
  object-fit: cover;
  object-position: center;
`;

export const theGateSpaIntro = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const theGateSpaParagraph = css`
  margin: 0;

  line-height: 1.8;
`;

export const theGateSpaSection = css`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const theGateSpaSectionImage = css`
  display: block;

  width: 100%;
  aspect-ratio: 16 / 9;

  border-radius: 6px;
  object-fit: cover;
  object-position: center 42%;
`;

export const theGateSpaSectionCopy = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const theGateSpaSectionTitle = css`
  margin: 0;

  line-height: 1.45;
`;

export const theGateSpaFeatureStack = css`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const theGateSpaFeature = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const theGateSpaImageGrid = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 10px;

  width: 100%;
`;

export const theGateSpaFeatureGrid = css`
  display: block;

  width: 100%;
  aspect-ratio: 4 / 3;

  border-radius: 6px;
  object-fit: cover;
  object-position: center;
`;

export const theGateSpaFeatureCopy = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
