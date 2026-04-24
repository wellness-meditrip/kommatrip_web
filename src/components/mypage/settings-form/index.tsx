import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Text, Dim } from '@/components';
import { theme } from '@/styles';
import { useToast } from '@/hooks';
import {
  useGetUserProfileQuery,
  usePostMarketingConsentMutation,
  useDeleteUserAccountMutation,
} from '@/queries';
import { getErrorMessage } from '@/utils/error-handler';
import { QUERY_KEYS } from '@/queries/query-keys';
import { ROUTES } from '@/constants';
import { useLocalizedRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth';
import {
  clearClientAuthSession,
  clearLogoutRedirectPending,
  markLogoutRedirectPending,
} from '@/utils/auth-session';
import { useTranslations } from 'next-intl';

type Variant = 'page' | 'embedded';

interface Props {
  readonly variant?: Variant;
}

export function SettingsForm({ variant = 'page' }: Props) {
  const router = useLocalizedRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useTranslations('mypage');
  const [isMarketingEnabled, setIsMarketingEnabled] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isEmbedded = variant === 'embedded';
  const { data: profileData } = useGetUserProfileQuery();
  const postMarketingConsentMutation = usePostMarketingConsentMutation();
  const deleteUserAccountMutation = useDeleteUserAccountMutation();

  useEffect(() => {
    if (!profileData?.user) return;
    setIsMarketingEnabled(!!profileData.user.marketing_consent);
  }, [profileData]);

  const handleMarketingToggle = () => {
    const nextValue = !isMarketingEnabled;
    setIsMarketingEnabled(nextValue);
    postMarketingConsentMutation.mutate(
      { marketing_consent: nextValue },
      {
        onSuccess: () => {
          useAuthStore.getState().patchUser({ marketing_consent: nextValue });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
          showToast({ title: t('toast.marketingConsentUpdated'), icon: 'check' });
        },
        onError: (error: unknown) => {
          setIsMarketingEnabled(!nextValue);
          const message = getErrorMessage(error, t('toast.marketingConsentUpdateFailed'));
          showToast({ title: message, icon: 'exclaim' });
        },
      }
    );
  };

  const handleLogout = async () => {
    markLogoutRedirectPending();

    try {
      await clearClientAuthSession();
      queryClient.removeQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
      await router.replace(ROUTES.HOME);
    } finally {
      clearLogoutRedirectPending();
    }
  };

  const handleDeleteAccount = () => {
    const userId = profileData?.user?.id;
    if (!userId) return;

    deleteUserAccountMutation.mutate(userId, {
      onSuccess: async () => {
        setIsDeleteModalOpen(false);
        await clearClientAuthSession();
        queryClient.clear();
        await router.replace(ROUTES.HOME);
      },
      onError: (error: unknown) => {
        setIsDeleteModalOpen(false);
        const message = getErrorMessage(error, '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.');
        showToast({ title: message, icon: 'exclaim' });
      },
    });
  };

  return (
    <>
      <section css={page(isEmbedded)}>
        {!isEmbedded && (
          <Text tag="p" typo="title_M" color="text_primary" css={pageTitle}>
            {t('settings.title')}
          </Text>
        )}
        <div css={contentWrapper(isEmbedded)}>
          <div css={card}>
            <div css={settingRow}>
              <div css={settingText}>
                <Text typo="title_S" color="text_primary">
                  {t('settings.marketingConsent.title')}
                </Text>
                <Text typo="body_S" color="text_secondary">
                  {t('settings.marketingConsent.description')}
                </Text>
              </div>
              <label css={toggleWrapper} aria-label={t('settings.marketingConsent.title')}>
                <input
                  type="checkbox"
                  checked={isMarketingEnabled}
                  onChange={handleMarketingToggle}
                  css={toggleInput}
                  disabled={postMarketingConsentMutation.isPending}
                />
                <span css={toggleTrack(isMarketingEnabled)} />
              </label>
            </div>
          </div>
          <div css={card}>
            <button type="button" css={textButton} onClick={handleLogout}>
              <Text typo="title_S" color="text_primary">
                {t('settings.actions.logout')}
              </Text>
            </button>
            <button type="button" css={textButtonMuted} onClick={() => setIsDeleteModalOpen(true)}>
              <Text typo="title_S" color="text_tertiary">
                {t('settings.actions.deleteAccount')}
              </Text>
            </button>
          </div>
        </div>
      </section>

      {isDeleteModalOpen && (
        <>
          <Dim fullScreen onClick={() => setIsDeleteModalOpen(false)} />
          <div css={modalCard}>
            <div css={modalText}>
              <Text typo="title_M" color="text_primary">
                {t('settings.actions.deleteAccountModalTitle')}
              </Text>
              <Text typo="body_M" color="text_tertiary" css={modalDescription}>
                {t('settings.actions.deleteAccountModalDescription')}
              </Text>
            </div>
            <div css={modalButtonRow}>
              <button
                css={modalCancel}
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteUserAccountMutation.isPending}
              >
                <Text typo="title_S" color="text_primary">
                  {t('settings.actions.deleteAccountModalCancel')}
                </Text>
              </button>
              <button
                css={modalConfirm}
                onClick={handleDeleteAccount}
                disabled={deleteUserAccountMutation.isPending}
              >
                <Text typo="title_S" color="white">
                  {deleteUserAccountMutation.isPending
                    ? '처리 중...'
                    : t('settings.actions.deleteAccountModalConfirm')}
                </Text>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const page = (isEmbedded: boolean) => css`
  flex: 1;
  background: ${isEmbedded ? 'transparent' : theme.colors.bg_surface1};
  padding: ${isEmbedded ? '0' : '20px 16px 120px'};
`;

const pageTitle = css`
  margin: 0 0 20px;
`;

const contentWrapper = (isEmbedded: boolean) => css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: ${isEmbedded ? '100%' : '640px'};
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

const settingRow = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const settingText = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const toggleWrapper = css`
  position: relative;
  width: 52px;
  height: 30px;
  flex-shrink: 0;
`;

const toggleInput = css`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const toggleTrack = (isActive: boolean) => css`
  position: relative;
  display: inline-flex;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  background: ${isActive ? theme.colors.primary50 : theme.colors.gray400};
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${isActive ? '26px' : '3px'};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${theme.colors.white};
    transition: left 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const textButton = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  background: none;
  border: none;
  cursor: pointer;
`;

const textButtonMuted = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  background: none;
  border: none;
  cursor: pointer;
`;

const modalCard = css`
  position: fixed;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  width: calc(100% - 48px);
  max-width: 360px;
  background: ${theme.colors.bg_default};
  border-radius: 20px;
  padding: 28px 24px 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const modalText = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const modalDescription = css`
  line-height: 1.5;
`;

const modalButtonRow = css`
  display: flex;
  gap: 10px;
`;

const modalCancel = css`
  flex: 1;
  padding: 14px 0;
  border-radius: 12px;
  border: 1px solid ${theme.colors.gray200};
  background: ${theme.colors.bg_default};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const modalConfirm = css`
  flex: 1;
  padding: 14px 0;
  border-radius: 12px;
  border: none;
  background: ${theme.colors.red200};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
