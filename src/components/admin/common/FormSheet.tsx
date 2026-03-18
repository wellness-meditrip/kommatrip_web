import { type ReactNode, useEffect } from 'react';
import { css, keyframes } from '@emotion/react';
import { Portal } from '@/components/portal';
import { Text } from '@/components/text';
import { adminConsolePalette } from '../admin-console.styles';

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  sideNav?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
}

const clearBodyPointerSoon = () => {
  if (typeof document === 'undefined') return;

  document.body.style.pointerEvents = '';
  queueMicrotask(() => {
    document.body.style.pointerEvents = '';
  });
  requestAnimationFrame(() => {
    document.body.style.pointerEvents = '';
  });
};

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  sideNav,
  headerActions,
  footer,
  width,
}: FormSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    clearBodyPointerSoon();

    return () => {
      document.body.style.overflow = previousOverflow;
      clearBodyPointerSoon();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onOpenChange(false);
      clearBodyPointerSoon();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) return null;

  const close = () => {
    onOpenChange(false);
    clearBodyPointerSoon();
  };

  return (
    <Portal>
      <div css={sheetRoot}>
        <button type="button" aria-label="시트 닫기" css={sheetBackdrop} onClick={close} />
        <section css={sheetPanel(width)}>
          <header css={sheetHeader}>
            <div css={sheetHeaderCopy}>
              <Text tag="h1" typo="title1" css={sheetTitle}>
                {title}
              </Text>
              {description && (
                <Text typo="body9" css={sheetDescription}>
                  {description}
                </Text>
              )}
            </div>
            {headerActions && <div css={sheetHeaderActions}>{headerActions}</div>}
          </header>

          <div css={sheetBody(Boolean(sideNav))}>
            {sideNav && (
              <aside css={sheetSideNav}>
                <div css={sheetSideNavInner}>{sideNav}</div>
              </aside>
            )}
            <div css={sheetContent}>{children}</div>
          </div>

          {footer && <footer css={sheetFooter}>{footer}</footer>}
        </section>
      </div>
    </Portal>
  );
}

const sheetEnter = keyframes`
  from {
    opacity: 0;
    transform: translateX(56px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const sheetRoot = css`
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
`;

const sheetBackdrop = css`
  position: absolute;
  inset: 0;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(3, 8, 14, 0.56);
  backdrop-filter: blur(2px);
`;

const sheetPanel = (width?: number | string) => css`
  position: relative;
  z-index: 1;
  width: ${typeof width === 'number' ? `${width}px` : (width ?? 'min(1120px, 100vw)')};
  max-width: 100%;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 28px 0 0 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(132, 155, 130, 0.08), transparent 22%),
    linear-gradient(180deg, rgba(8, 14, 25, 0.98) 0%, rgba(5, 10, 18, 0.99) 100%);
  border: 1px solid ${adminConsolePalette.border};
  box-shadow: 0 32px 96px rgba(2, 6, 14, 0.4);
  animation: ${sheetEnter} 0.28s ease-out;

  @media (max-width: 1024px) {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }
`;

const sheetHeader = css`
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  padding: 24px 28px;
  border-bottom: 1px solid ${adminConsolePalette.borderSoft};

  @media (max-width: 860px) {
    flex-direction: column;
    padding: 22px 20px;
  }
`;

const sheetHeaderCopy = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const sheetTitle = css`
  color: ${adminConsolePalette.text};
`;

const sheetDescription = css`
  color: ${adminConsolePalette.textMuted};
`;

const sheetHeaderActions = css`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const sheetBody = (hasSideNav: boolean) => css`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: ${hasSideNav ? '240px minmax(0, 1fr)' : '1fr'};
  align-items: stretch;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const sheetSideNav = css`
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${adminConsolePalette.borderSoft};
  background: rgba(6, 12, 21, 0.34);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid ${adminConsolePalette.borderSoft};
  }
`;

const sheetSideNavInner = css`
  flex: 1;
  min-height: 0;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 18px;

  @media (max-width: 1024px) {
    position: static;
    overflow-x: auto;
    flex-direction: row;
    padding: 18px 20px;
  }
`;

const sheetContent = css`
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;

  & > * {
    flex: 1;
    min-height: 0;
  }
`;

const sheetFooter = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px;
  border-top: 1px solid ${adminConsolePalette.borderSoft};
  background: rgba(6, 12, 21, 0.88);
  backdrop-filter: blur(12px);

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
    padding: 18px 20px;
  }
`;
