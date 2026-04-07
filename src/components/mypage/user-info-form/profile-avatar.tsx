import { css } from '@emotion/react';
import { SafeProfileImage } from '@/components';
import { ImageUploadPlus } from '@/icons';
import { theme } from '@/styles';

interface ProfileAvatarProps {
  src: string;
  isDesktop: boolean;
  onAvatarClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ProfileAvatar({
  src,
  isDesktop,
  onAvatarClick,
  onEditClick,
  onDeleteClick,
}: ProfileAvatarProps) {
  return (
    <div css={profileRow(isDesktop)}>
      <button
        type="button"
        css={profileButton(isDesktop)}
        onClick={onAvatarClick}
        aria-label="Edit profile image"
      >
        <SafeProfileImage
          src={src}
          css={profileImage}
          alt="Profile"
          fallback={<ImageUploadPlus width={22} height={22} />}
        />
      </button>
      {isDesktop && (
        <div css={profileActions}>
          <button type="button" css={actionButton} onClick={onEditClick}>
            Edit
          </button>
          <button type="button" css={[actionButton, actionButtonDanger]} onClick={onDeleteClick}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const profileRow = (isDesktop: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: ${isDesktop ? 'flex-start' : 'center'};
  gap: 16px;
  margin-top: 4px;
`;

const profileButton = (isDesktop: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${isDesktop ? '96px' : '84px'};
  height: ${isDesktop ? '96px' : '84px'};
  border-radius: 50%;
  border: none;
  background: ${theme.colors.primary10};
  cursor: ${isDesktop ? 'default' : 'pointer'};
  overflow: hidden;

  svg path {
    stroke: ${theme.colors.primary50};
  }
`;

const profileImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const profileActions = css`
  display: flex;
  gap: 8px;
`;

const actionButton = css`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${theme.colors.border_default};
  background: ${theme.colors.white};
  color: ${theme.colors.text_primary};
  font-size: 13px;
  cursor: pointer;
`;

const actionButtonDanger = css`
  border-color: ${theme.colors.red200};
  color: ${theme.colors.red200};
`;
