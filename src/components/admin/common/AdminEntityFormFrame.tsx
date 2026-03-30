import type { ReactNode, RefObject } from 'react';
import { css } from '@emotion/react';
import { Text } from '@/components/text';
import {
  adminConsolePalette,
  adminHeroActions,
  adminHeroDescription,
  adminHeroSection,
  adminHeroTitle,
  adminSurfacePanel,
} from '../admin-console.styles';
import { FormSheet } from './FormSheet';

export type AdminEntityFormPresentation = 'page' | 'sheet';

interface AdminEntityFormFrameProps {
  presentation: AdminEntityFormPresentation;
  title: string;
  description: string;
  headerActions?: ReactNode;
  sideNav?: ReactNode;
  width?: number | string;
  onClose: () => void;
  scrollable?: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export function AdminEntityFormFrame({
  presentation,
  title,
  description,
  headerActions,
  sideNav,
  width,
  onClose,
  scrollable = presentation === 'sheet',
  scrollContainerRef,
  children,
}: AdminEntityFormFrameProps) {
  if (presentation === 'sheet') {
    return (
      <FormSheet
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={title}
        description={description}
        headerActions={headerActions}
        sideNav={sideNav}
        width={width}
      >
        {scrollable ? (
          <div ref={scrollContainerRef} css={sheetScrollArea}>
            <div css={sheetSections}>{children}</div>
          </div>
        ) : (
          children
        )}
      </FormSheet>
    );
  }

  return (
    <div css={pageWrapper}>
      <div css={pageInner}>
        <header css={headerSection}>
          <div css={headerCopy}>
            <Text tag="h1" typo="title1" css={titleText}>
              {title}
            </Text>
            <Text typo="body9" css={descriptionText}>
              {description}
            </Text>
          </div>
          {headerActions && <div css={headerActionsWrap}>{headerActions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

export function AdminEntityFormMessageCard({
  title,
  message,
  actions,
}: {
  title: string;
  message: string;
  actions?: ReactNode;
}) {
  return (
    <section css={messageCard}>
      <Text tag="h2" typo="title1" css={titleText}>
        {title}
      </Text>
      <Text typo="body9" css={descriptionText}>
        {message}
      </Text>
      {actions && <div css={headerActionsWrap}>{actions}</div>}
    </section>
  );
}

export const adminEntityFormActionRow = adminHeroActions;

export const adminEntityFormSectionButton = (isActive: boolean) => css`
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 16px;
  border: 1px solid ${isActive ? 'rgba(142, 164, 190, 0.16)' : 'transparent'};
  border-radius: 14px;
  background: ${isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  color: ${isActive ? adminConsolePalette.textStrong : adminConsolePalette.textMuted};
  font-size: 14px;
  font-weight: ${isActive ? 700 : 500};
  text-align: left;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${adminConsolePalette.textStrong};
  }

  @media (max-width: 1024px) {
    width: auto;
    white-space: nowrap;
  }
`;

export const adminEntityFormState = css`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
`;

const pageWrapper = css`
  padding: 0 0 120px;
`;

const pageInner = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const headerSection = adminHeroSection;

const headerCopy = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const headerActionsWrap = adminHeroActions;

const titleText = adminHeroTitle;

const descriptionText = adminHeroDescription;

const sheetScrollArea = css`
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 24px 28px 32px;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const sheetSections = css`
  display: flex;
  flex-direction: column;
  gap: 20px;

  & > section {
    scroll-margin-top: 24px;
  }
`;

const messageCard = css`
  ${adminSurfacePanel};
  gap: 16px;
`;
