import { css } from '@emotion/react';
import { colors } from '@/styles';

export const adminConsolePalette = {
  pageTop: '#0b1422',
  pageBottom: '#050b15',
  heroTop: '#09111c',
  heroBottom: '#070d17',
  surface: 'rgba(7, 13, 23, 0.94)',
  surfaceAlt: 'rgba(14, 22, 35, 0.98)',
  surfaceSoft: 'rgba(18, 28, 44, 0.92)',
  surfaceSubtle: 'rgba(255, 255, 255, 0.04)',
  surfaceMuted: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(142, 164, 190, 0.16)',
  borderSoft: 'rgba(142, 164, 190, 0.12)',
  borderStrong: 'rgba(148, 165, 184, 0.18)',
  text: '#f6f9ff',
  textStrong: '#eef4ff',
  textMuted: '#a1aec2',
  textSubtle: '#8d9aaf',
  textDim: '#6f7f98',
  accent: 'rgba(132, 155, 130, 0.92)',
  accentSoft: 'rgba(132, 155, 130, 0.18)',
  accentTint: 'rgba(132, 155, 130, 0.24)',
  accentText: '#dbe8dc',
  accentStrongText: '#071019',
  purple: 'linear-gradient(135deg, #6f66ff 0%, #4f46e5 100%)',
  dangerSoft: 'rgba(255, 103, 103, 0.08)',
  dangerBorder: 'rgba(255, 103, 103, 0.18)',
  dangerText: '#ffc8c8',
  warningSoft: 'rgba(227, 179, 111, 0.2)',
  warningText: '#f3d5a6',
  infoSoft: 'rgba(93, 134, 254, 0.12)',
  infoText: '#bfd0ff',
} as const;

export const adminPage = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const adminHeroSection = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  padding: 28px 30px;
  border: 1px solid ${adminConsolePalette.border};
  border-radius: 32px;

  background:
    radial-gradient(circle at top left, rgb(92 120 96 / 22%), transparent 32%),
    linear-gradient(
      180deg,
      ${adminConsolePalette.heroTop} 0%,
      ${adminConsolePalette.heroBottom} 100%
    );
  box-shadow: 0 28px 80px rgb(4 10 21 / 46%);

  @media (max-width: 860px) {
    flex-direction: column;

    padding: 24px 22px;
  }
`;

export const adminHeroActions = css`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const adminHeroTitle = css`
  color: ${adminConsolePalette.text};
`;

export const adminHeroDescription = css`
  color: ${adminConsolePalette.textMuted};
`;

export const adminHeroMeta = css`
  color: ${adminConsolePalette.textDim};
`;

export const adminConsoleSection = css`
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 24px;
  border-radius: 32px;

  background: linear-gradient(180deg, rgb(8 14 25 / 98%) 0%, rgb(5 10 18 / 98%) 100%);
  box-shadow: 0 30px 90px rgb(3 9 19 / 42%);

  @media (max-width: 860px) {
    padding: 18px;
  }
`;

export const adminSurfacePanel = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 24px;
  border-radius: 28px;

  background: ${adminConsolePalette.surfaceAlt};
  box-shadow: 0 24px 70px rgb(2 6 14 / 32%);
`;

export const adminSubtlePanel = css`
  display: flex;
  flex-direction: column;
  gap: 14px;

  padding: 20px;
  border-radius: 22px;

  background: rgb(14 22 35 / 88%);
`;

export const adminSectionHeader = css`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`;

export const adminCompactHeader = css`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
`;

export const adminCompactHeaderCopy = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  min-width: 0;
`;

export const adminCompactHeaderActions = css`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const adminCompactEyebrow = css`
  color: ${adminConsolePalette.textDim};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const adminSectionTitle = css`
  color: ${adminConsolePalette.text};
`;

export const adminSectionSubtitle = css`
  color: ${adminConsolePalette.textSubtle};
`;

export const adminCountText = css`
  color: ${adminConsolePalette.textSubtle};
`;

export const adminStatCard = css`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 20px;
  border-radius: 22px;

  background: rgb(14 22 35 / 98%);
  box-shadow: 0 18px 48px rgb(2 8 18 / 30%);
`;

export const adminStatLabel = css`
  color: ${adminConsolePalette.textSubtle};
`;

export const adminStatValue = css`
  color: ${adminConsolePalette.textStrong};
`;

export const adminCapsuleBadge = (options: {
  background: string;
  color: string;
  minWidth?: number;
  minHeight?: number;
}) => css`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  ${typeof options.minWidth === 'number' ? `min-width: ${options.minWidth}px;` : ''}
  min-height: ${typeof options.minHeight === 'number' ? `${options.minHeight}px` : '30px'};
  padding: 0 12px;
  border-radius: 999px;

  background: ${options.background};
  color: ${options.color};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

const compactActionButtonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 76px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;

  font-size: 12px;
  font-weight: 800;

  transition:
    transform 0.16s ease,
    opacity 0.16s ease,
    border-color 0.16s ease;

  cursor: pointer;
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    transform: none;

    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const adminInlineGhostButton = css`
  ${compactActionButtonBase};
  border: 1px solid rgb(148 165 184 / 18%);

  background: rgb(255 255 255 / 4%);
  color: #eef5ff;
`;

export const adminInlinePrimaryButton = css`
  ${compactActionButtonBase};
  background: rgb(132 155 130 / 92%);
  color: #071019;
`;

export const adminInlineDangerButton = css`
  ${compactActionButtonBase};
  border: 1px solid rgb(255 103 103 / 18%);

  background: rgb(255 103 103 / 8%);
  color: #ffc8c8;
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 76px;
  height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;

  font-size: 13px;
  font-weight: 800;

  transition:
    transform 0.16s ease,
    opacity 0.16s ease,
    border-color 0.16s ease;

  cursor: pointer;
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    transform: none;

    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const adminGhostButton = css`
  ${buttonBase};
  border: 1px solid ${adminConsolePalette.borderStrong};

  background: ${adminConsolePalette.surfaceSubtle};
  color: ${adminConsolePalette.textStrong};
`;

export const adminPrimaryButton = css`
  ${buttonBase};
  background: ${adminConsolePalette.accent};
  color: ${adminConsolePalette.accentStrongText};
`;

export const adminAccentButton = css`
  ${buttonBase};
  background: ${adminConsolePalette.purple};
  color: ${colors.white};
`;

export const adminDangerButton = css`
  ${buttonBase};
  border: 1px solid ${adminConsolePalette.dangerBorder};

  background: ${adminConsolePalette.dangerSoft};
  color: ${adminConsolePalette.dangerText};
`;

export const adminSegmented = css`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  padding: 6px;
  border-radius: 18px;

  background: ${adminConsolePalette.surfaceSoft};
`;

export const adminSegmentButton = (active: boolean) => css`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  min-height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;

  background: ${active ? 'rgba(246, 250, 255, 0.98)' : 'transparent'};
  color: ${active ? '#0d1727' : '#b7c3d7'};
  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
`;

export const adminSegmentCount = (active: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;

  background: ${active ? 'rgba(13, 23, 39, 0.08)' : 'rgba(248, 250, 252, 0.08)'};
  color: inherit;
  font-size: 11px;
  font-weight: 800;
`;

export const adminSearchBox = css`
  display: flex;
  align-items: center;
  gap: 12px;

  min-height: 54px;
  padding: 0 16px;
  border-radius: 18px;

  background: rgb(245 247 251 / 8%);
`;

export const adminSearchIcon = css`
  color: #99a8bd;
  font-size: 18px;
  line-height: 1;
`;

export const adminSearchInput = css`
  flex: 1;

  min-width: 0;
  border: none;
  outline: none;

  background: transparent;
  color: ${adminConsolePalette.text};
  font-size: 15px;
  font-weight: 500;

  &::placeholder {
    color: #8b97a9;
  }
`;

export const adminSummaryPill = css`
  display: inline-flex;
  align-items: center;

  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;

  background: ${adminConsolePalette.accentSoft};
  color: ${adminConsolePalette.accentText};
  font-size: 12px;
  font-weight: 700;
`;

export const adminMetaCard = css`
  display: flex;
  flex-direction: column;
  gap: 4px;

  padding: 14px;
  border: 1px solid ${adminConsolePalette.borderSoft};
  border-radius: 16px;

  background: rgb(255 255 255 / 4%);
`;

export const adminMetaLabel = css`
  color: ${adminConsolePalette.textDim};
`;

export const adminMetaValue = css`
  color: ${adminConsolePalette.textStrong};
`;

export const adminTagChip = css`
  display: inline-flex;
  align-items: center;

  min-height: 30px;
  padding: 0 12px;
  border: 1px solid rgb(132 155 130 / 24%);
  border-radius: 12px;

  background: rgb(18 28 44 / 82%);
  color: #d5e1d7;
  font-size: 12px;
  font-weight: 700;
`;

export const adminMutedBadge = css`
  display: inline-flex;
  align-items: center;

  min-height: 30px;
  padding: 0 12px;
  border-radius: 12px;

  background: ${adminConsolePalette.surfaceMuted};
  color: ${adminConsolePalette.textSubtle};
  font-size: 12px;
  font-weight: 700;
`;

export const adminEmptyState = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  min-height: 240px;
  padding: 32px 20px;

  text-align: center;
`;

export const adminEmptyTitle = css`
  color: ${adminConsolePalette.text};
`;

export const adminEmptyDescription = css`
  color: ${adminConsolePalette.textSubtle};
`;
