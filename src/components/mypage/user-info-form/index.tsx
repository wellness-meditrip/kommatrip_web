import { useState } from 'react';
import { css } from '@emotion/react';
import { CTAButton, RoundButton, Text } from '@/components';
import { PasswordResetModal } from '@/components/password-reset-modal';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { CONTACT_METHODS, CONTACT_METHOD_FIELD_MAP } from './constants';
import { useUserInfoForm } from './use-user-info-form';
import { useProfileImage } from './use-profile-image';
import { ProfileAvatar } from './profile-avatar';
import { ImageActionSheet } from './image-action-sheet';

type Variant = 'page' | 'embedded';

interface Props {
  variant?: Variant;
}

export function UserInfoForm({ variant = 'page' }: Props) {
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const isEmbedded = variant === 'embedded';

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const {
    usernameField,
    countryField,
    errors,
    setValue,
    onSubmit,
    email,
    passwordSet,
    profileImageUrl,
    canEditProfileImage,
    contactMethod,
    selectedContactValue,
    contactPlaceholder,
    countryOptions,
    isSaving,
    isPasswordResetModalOpen,
    setIsPasswordResetModalOpen,
  } = useUserInfoForm();

  const { fileInputRef, handleEditClick, handleFileChange, handleDelete } = useProfileImage({
    profileImageUrl,
    onImageChange: (url) => setValue('profileImageUrl', url),
  });

  return (
    <section css={page(isEmbedded)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        css={hiddenInput}
      />
      <div css={contentWrapper(isDesktop, isEmbedded)}>
        <div css={[card, userInfoCard(isDesktop)]}>
          {!isEmbedded && (
            <Text typo="title_M" color="text_primary">
              User Information
            </Text>
          )}
          <ProfileAvatar
            src={profileImageUrl}
            isDesktop={isDesktop}
            editable={canEditProfileImage}
            onAvatarClick={() => {
              if (!isDesktop && canEditProfileImage) {
                setIsImageModalOpen(true);
              }
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDelete}
          />
          <div css={field}>
            <Text typo="title_S" color="text_primary">
              User name
            </Text>
            <input css={input} {...usernameField} />
            {errors.username?.message && (
              <Text typo="body_S" color="red200">
                {errors.username.message}
              </Text>
            )}
          </div>
          <div css={field}>
            <Text typo="title_S" color="text_primary">
              Password
            </Text>
            <div css={inputWithIcon}>
              <input
                css={[input, inputWithIconField]}
                type="password"
                value={passwordSet ? '********' : ''}
                readOnly
                placeholder={passwordSet ? undefined : 'Not set'}
              />
              <button
                type="button"
                css={iconButton}
                aria-label="Edit password"
                onClick={() => setIsPasswordResetModalOpen(true)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path
                    d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5z"
                    stroke={theme.colors.text_tertiary}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.5 7l3.5 3.5"
                    stroke={theme.colors.text_tertiary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div css={card}>
          <Text typo="title_M" color="text_primary">
            Contact
          </Text>
          <div css={field}>
            <Text typo="title_S" color="text_primary">
              Email Address
            </Text>
            <input css={input} type="email" value={email} readOnly />
          </div>
          <div css={field}>
            <Text typo="title_S" color="text_primary">
              Contact Method
            </Text>
            <div css={contactMethods}>
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  css={contactButton(method === contactMethod)}
                  onClick={() => setValue('contactMethod', method)}
                  aria-pressed={method === contactMethod}
                >
                  <Text
                    typo="button_XS"
                    color={method === contactMethod ? 'text_primary' : 'text_tertiary'}
                  >
                    {method}
                  </Text>
                </button>
              ))}
            </div>
            <input
              css={input}
              value={selectedContactValue}
              onChange={(e) => setValue(CONTACT_METHOD_FIELD_MAP[contactMethod], e.target.value)}
              placeholder={contactPlaceholder}
            />
          </div>
        </div>

        <div css={card}>
          <Text typo="title_M" color="text_primary">
            Country
          </Text>
          <div css={field}>
            <Text typo="title_S" color="text_primary">
              Country
            </Text>
            <div css={selectContainer}>
              <select css={select} {...countryField}>
                <option value="">Select country</option>
                {countryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.country?.message && (
              <Text typo="body_S" color="red200">
                {errors.country.message}
              </Text>
            )}
          </div>
        </div>
      </div>

      {isDesktop ? (
        <div css={desktopActions(isEmbedded)}>
          <RoundButton size="L" disabled={isSaving} onClick={onSubmit}>
            <Text typo="button_L" color="bg_default">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </RoundButton>
        </div>
      ) : (
        <CTAButton disabled={isSaving} onClick={onSubmit}>
          {isSaving ? 'Saving...' : 'Save'}
        </CTAButton>
      )}

      {!isDesktop && isImageModalOpen && canEditProfileImage && (
        <ImageActionSheet
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}

      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
      />
    </section>
  );
}

const page = (isEmbedded: boolean) => css`
  flex: 1;
  background: ${isEmbedded ? 'transparent' : theme.colors.bg_surface1};
`;

const contentWrapper = (isDesktop: boolean, isEmbedded: boolean) => css`
  display: grid;
  gap: 16px;
  padding: ${isEmbedded ? '0' : isDesktop ? '32px 40px 24px' : '20px 16px 120px'};
  grid-template-columns: ${isDesktop ? 'repeat(2, minmax(0, 1fr))' : '1fr'};
  max-width: ${isEmbedded ? '100%' : isDesktop ? '960px' : '100%'};
  margin: 0 auto;
`;

const card = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: ${theme.colors.bg_default};
  box-shadow: 0 0 12px ${theme.colors.grayOpacity50};
`;

const userInfoCard = (isDesktop: boolean) =>
  isDesktop
    ? css`
        grid-column: 1 / -1;
      `
    : css``;

const field = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const input = css`
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid ${theme.colors.text_tertiary};
  font-size: 14px;
  font-family: inherit;
  background: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary50};
  }
`;

const inputWithIcon = css`
  position: relative;
  display: flex;
  align-items: center;
`;

const inputWithIconField = css`
  padding-right: 44px;
`;

const iconButton = css`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const contactMethods = css`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
`;

const contactButton = (isSelected: boolean) => css`
  padding: 10px 0;
  border-radius: 8px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.border_default};
  background: ${isSelected ? theme.colors.primary10Opacity40 : theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const selectContainer = css`
  position: relative;
`;

const select = css`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.text_tertiary};
  border-radius: 10px;
  background-color: ${theme.colors.white};
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2365635E' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  appearance: none;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary50};
  }
`;

const desktopActions = (isEmbedded: boolean) => css`
  display: flex;
  justify-content: flex-end;
  margin: ${isEmbedded ? '16px 0 0' : '8px auto 40px'};
  padding: ${isEmbedded ? '0' : '0 40px'};
  max-width: ${isEmbedded ? '100%' : '960px'};
`;

const hiddenInput = css`
  display: none;
`;
