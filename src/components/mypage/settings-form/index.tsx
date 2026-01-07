import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Text } from '@/components';
import { theme } from '@/styles';
import { useToast } from '@/hooks';
import { useGetUserProfileQuery, usePostMarketingConsentMutation } from '@/queries';
import { getErrorMessage } from '@/utils/error-handler';
import { QUERY_KEYS } from '@/queries/query-keys';
import { useAuthStore } from '@/store/auth';
import { deleteCookie } from '@/utils/cookie';
import { ROUTES } from '@/constants';
import { useTranslations } from 'next-intl';

type Variant = 'page' | 'embedded';

interface Props {
  variant?: Variant;
}

export function SettingsForm({ variant = 'page' }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useTranslations('mypage');
  const [isMarketingEnabled, setIsMarketingEnabled] = useState(true);
  const isEmbedded = variant === 'embedded';
  const { data: profileData } = useGetUserProfileQuery();
  const postMarketingConsentMutation = usePostMarketingConsentMutation();

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
        onSuccess: (response) => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_PROFILE });
          showToast({ title: t('toast.marketingConsentUpdated'), icon: 'check' });
        },
        onError: (error: unknown) => {
          setIsMarketingEnabled(!nextValue);
          const message = getErrorMessage(error, 'Failed to update marketing consent');
          showToast({ title: message, icon: 'exclaim' });
        },
      }
    );
  };

  const handleLogout = async () => {
    useAuthStore.getState().clearAuth();
    deleteCookie('refreshToken');

    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('[Logout] Failed to clear auth cookies', error);
    }

    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('[Logout] NextAuth signOut failed', error);
    }

    router.replace(ROUTES.HOME);
  };

  return (
    <section css={page(isEmbedded)}>
      {!isEmbedded && (
        <Text tag="p" typo="title_M" color="text_primary" css={pageTitle}>
          Settings
        </Text>
      )}
      <div css={contentWrapper(isEmbedded)}>
        <div css={card}>
          <div css={settingRow}>
            <div css={settingText}>
              <Text typo="title_S" color="text_primary">
                Consent to receiving marketing
              </Text>
              <Text typo="body_S" color="text_secondary">
                If you agree to receive marketing, please set it up.
              </Text>
            </div>
            <label css={toggleWrapper}>
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
              Log out
            </Text>
          </button>
          <button type="button" css={textButtonMuted}>
            <Text typo="title_S" color="text_tertiary">
              Delete account
            </Text>
          </button>
        </div>
      </div>
    </section>
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
