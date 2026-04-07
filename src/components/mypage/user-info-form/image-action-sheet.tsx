import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Text } from '@/components';
import { theme } from '@/styles';

interface ImageActionSheetProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ImageActionSheet({ onEdit, onDelete, onClose }: ImageActionSheetProps) {
  const t = useTranslations('common');

  return (
    <>
      <div css={modalOverlay} onClick={onClose} />
      <div css={modalSheet}>
        <div css={modalHandle} />
        <div css={modalOptions}>
          <button
            type="button"
            css={modalOption}
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            <Text typo="title_M" color="primary50">
              {t('button.edit')}
            </Text>
          </button>
          <button
            type="button"
            css={[modalOption, modalOptionDanger]}
            onClick={() => {
              onClose();
              onDelete();
            }}
          >
            <Text typo="title_M" color="red200">
              {t('button.delete')}
            </Text>
          </button>
        </div>
      </div>
    </>
  );
}

const modalOverlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: ${theme.zIndex.overlay};
`;

const modalSheet = css`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px;
  border-radius: 24px 24px 0 0;
  background: ${theme.colors.white};
  z-index: ${theme.zIndex.actionSheet};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const modalHandle = css`
  width: 40px;
  height: 4px;
  margin: 0 auto 24px;
  border-radius: 2px;
  background: ${theme.colors.gray300};
`;

const modalOptions = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const modalOption = css`
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.colors.bg_surface1};
  }
`;

const modalOptionDanger = css`
  &:hover {
    background: rgba(255, 103, 103, 0.12);
  }
`;
