import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { css } from '@emotion/react';
import { CTAButton, RoundButton, Text } from '@/components';
import { PasswordResetModal } from '@/components/password-reset-modal';
import { ImageUploadPlus } from '@/icons';
import { theme } from '@/styles';
import { useMediaQuery, useToast } from '@/hooks';
import {
  useDeleteUserProfileImageMutation,
  useGetUserProfileQuery,
  usePatchUserProfileMutation,
  usePostUserProfileImageMutation,
} from '@/queries';
import { getErrorMessage } from '@/utils/error-handler';
import { QUERY_KEYS } from '@/queries/query-keys';

const CONTACT_METHODS = ['Line', 'Whats App', 'Kakao', 'Phone'] as const;
const CONTACT_METHOD_FIELD_MAP = {
  Line: 'line',
  'Whats App': 'whatsapp',
  Kakao: 'kakao',
  Phone: 'phone',
} as const;
const CONTACT_PLACEHOLDER_MAP = {
  Line: 'Line ID',
  'Whats App': '010-1234-5678',
  Kakao: 'Kakao ID',
  Phone: '010-1234-5678',
} as const;
const COUNTRY_OPTIONS = ['Japan', 'Korea', 'United States'] as const;

type ContactMethod = (typeof CONTACT_METHODS)[number];
type ContactField = (typeof CONTACT_METHOD_FIELD_MAP)[ContactMethod];

type Variant = 'page' | 'embedded';

interface Props {
  variant?: Variant;
}

export function UserInfoForm({ variant = 'page' }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useTranslations('mypage');
  const tValidation = useTranslations('validation');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const [email, setEmail] = useState('');
  const [passwordSet, setPasswordSet] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('Line');
  const [contactValues, setContactValues] = useState<Record<ContactField, string>>({
    line: '',
    whatsapp: '',
    kakao: '',
    phone: '',
  });
  const [country, setCountry] = useState('');
  const [countryError, setCountryError] = useState('');
  const hasInitialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const previousImageUrlRef = useRef('');

  const { data: profileData } = useGetUserProfileQuery();
  const patchMutation = usePatchUserProfileMutation();
  const postImageMutation = usePostUserProfileImageMutation();
  const deleteImageMutation = useDeleteUserProfileImageMutation();

  const validateUsername = useCallback(
    (value: string) => {
      if (!value) return tValidation('username.required');
      if (!/^[A-Za-z0-9]{2,10}$/.test(value)) {
        return tValidation('username.invalid');
      }
      return '';
    },
    [tValidation]
  );

  useEffect(() => {
    if (!profileData?.user || hasInitialized.current) return;

    const user = profileData.user;
    setUserName(user.username ?? '');
    setUserNameError(validateUsername(user.username ?? ''));
    setEmail(user.email ?? '');
    setPasswordSet(!!user.password_set);
    setProfileImageUrl(user.profile_image_url ?? '');
    setCountry(user.country ?? '');
    setCountryError('');
    setContactValues({
      line: user.line ?? '',
      whatsapp: user.whatsapp ?? '',
      kakao: user.kakao ?? '',
      phone: user.phone ?? '',
    });

    const initialMethod = CONTACT_METHODS.find((method) => {
      const field = CONTACT_METHOD_FIELD_MAP[method];
      return (user[field] ?? '').length > 0;
    });
    setContactMethod(initialMethod ?? 'Line');
    hasInitialized.current = true;
  }, [profileData, validateUsername]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleAvatarClick = () => {
    if (!isDesktop) {
      setIsImageModalOpen(true);
    }
  };

  const handleImageEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast({ title: t('toast.profileImageTypeError'), icon: 'exclaim' });
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: t('toast.profileImageSizeError'), icon: 'exclaim' });
      event.target.value = '';
      return;
    }

    previousImageUrlRef.current = profileImageUrl;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setProfileImageUrl(previewUrl);

    postImageMutation.mutate(file, {
      onSuccess: (response) => {
        if (response.user?.profile_image_url) {
          setProfileImageUrl(response.user.profile_image_url);
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
        showToast({ title: t('toast.profileImageUploaded'), icon: 'check' });
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error, 'Failed to update profile image');
        showToast({ title: message, icon: 'exclaim' });
        setProfileImageUrl(previousImageUrlRef.current);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      },
      onSettled: () => {
        event.target.value = '';
      },
    });
  };

  const handleImageDelete = () => {
    deleteImageMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (response.user?.profile_image_url === '' || response.user?.profile_image_url == null) {
          setProfileImageUrl('');
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
        showToast({ title: t('toast.profileImageDeleted'), icon: 'check' });
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error, 'Failed to delete profile image');
        showToast({ title: message, icon: 'exclaim' });
      },
    });
  };

  const handleContactMethodChange = (method: ContactMethod) => {
    setContactMethod(method);
  };

  const handleContactValueChange = (value: string) => {
    const field = CONTACT_METHOD_FIELD_MAP[contactMethod];
    setContactValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const nextUsernameError = validateUsername(userName);
    setUserNameError(nextUsernameError);
    const nextCountryError = country ? '' : '';
    setCountryError(nextCountryError);

    const firstError = nextUsernameError || nextCountryError;
    if (firstError) {
      showToast({ title: firstError, icon: 'exclaim' });
      return;
    }

    patchMutation.mutate(
      {
        username: userName,
        country,
        line: contactValues.line,
        whatsapp: contactValues.whatsapp,
        kakao: contactValues.kakao,
        phone: contactValues.phone,
      },
      {
        onSuccess: (response) => {
          const user = response.user;
          setUserName(user.username ?? '');
          setEmail(user.email ?? '');
          setPasswordSet(!!user.password_set);
          setProfileImageUrl(user.profile_image_url ?? '');
          setCountry(user.country ?? '');
          setContactValues({
            line: user.line ?? '',
            whatsapp: user.whatsapp ?? '',
            kakao: user.kakao ?? '',
            phone: user.phone ?? '',
          });

          queryClient.setQueryData(QUERY_KEYS.GET_USER_PROFILE, response);
          showToast({ title: t('toast.profileUpdated'), icon: 'check' });
        },
        onError: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to update profile');
          showToast({ title: message, icon: 'exclaim' });
        },
      }
    );
  };

  const selectedContactValue = contactValues[CONTACT_METHOD_FIELD_MAP[contactMethod]] ?? '';
  const contactPlaceholder = CONTACT_PLACEHOLDER_MAP[contactMethod];
  const countryOptions = COUNTRY_OPTIONS.includes(country as (typeof COUNTRY_OPTIONS)[number])
    ? COUNTRY_OPTIONS
    : country
      ? [...COUNTRY_OPTIONS, country]
      : COUNTRY_OPTIONS;

  const isSaving = patchMutation.isPending;
  const isEmbedded = variant === 'embedded';

  return (
    <section css={page(isEmbedded)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleImageFileChange}
        css={hiddenInput}
      />
      <div css={contentWrapper(isDesktop, isEmbedded)}>
        <div css={[card, userInfoCard(isDesktop)]}>
          {!isEmbedded && (
            <Text typo="title_M" color="text_primary">
              User Information
            </Text>
          )}
          <div css={profileRow(isDesktop)}>
            <button
              type="button"
              css={profileButton(isDesktop)}
              onClick={handleAvatarClick}
              aria-label="Edit profile image"
            >
              {profileImageUrl ? (
                <img css={profileImage} src={profileImageUrl} alt="Profile" />
              ) : (
                <ImageUploadPlus width={22} height={22} />
              )}
            </button>
            {isDesktop && (
              <div css={profileActions}>
                <button type="button" css={actionButton} onClick={handleImageEditClick}>
                  Edit
                </button>
                <button
                  type="button"
                  css={[actionButton, actionButtonDanger]}
                  onClick={handleImageDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div css={field}>
            <Text typo="title_S" color="text_primary">
              User name
            </Text>
            <input
              css={input}
              value={userName}
              onChange={(event) => {
                const nextValue = event.target.value;
                setUserName(nextValue);
                setUserNameError(validateUsername(nextValue));
              }}
            />
            {userNameError && (
              <Text typo="body_S" color="red200">
                {userNameError}
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
                  onClick={() => handleContactMethodChange(method)}
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
              onChange={(event) => handleContactValueChange(event.target.value)}
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
              <select
                css={select}
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                  setCountryError('');
                }}
              >
                <option value="">Select country</option>
                {countryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {countryError && (
              <Text typo="body_S" color="red200">
                {countryError}
              </Text>
            )}
          </div>
        </div>
      </div>

      {isDesktop ? (
        <div css={desktopActions(isEmbedded)}>
          <RoundButton size="L" disabled={isSaving} onClick={handleSave}>
            <Text typo="button_L" color="bg_default">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </RoundButton>
        </div>
      ) : (
        <CTAButton disabled={isSaving} onClick={handleSave}>
          {isSaving ? 'Saving...' : 'Save'}
        </CTAButton>
      )}

      {!isDesktop && isImageModalOpen && (
        <>
          <div css={modalOverlay} onClick={() => setIsImageModalOpen(false)} />
          <div css={modalSheet}>
            <div css={modalHandle} />
            <div css={modalOptions}>
              <button
                type="button"
                css={modalOption}
                onClick={() => {
                  setIsImageModalOpen(false);
                  handleImageEditClick();
                }}
              >
                <Text typo="title_M" color="primary50">
                  Edit
                </Text>
              </button>
              <button
                type="button"
                css={[modalOption, modalOptionDanger]}
                onClick={() => {
                  setIsImageModalOpen(false);
                  handleImageDelete();
                }}
              >
                <Text typo="title_M" color="red200">
                  Delete
                </Text>
              </button>
            </div>
          </div>
        </>
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

const hiddenInput = css`
  display: none;
`;
