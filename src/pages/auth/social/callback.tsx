import { useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Loading } from '@/components';
import { useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { postSocialLogin } from '@/apis/auth';
import { applyAuthSession, resolveSafeAuthRedirect } from '@/utils/auth-session';
import {
  consumePendingSocialAuth,
  parseSocialCallback,
  validateSocialCallback,
} from '@/utils/social-auth';
import { getAuthFeedback, resolveSocialLoginFailureFeedbackCode } from '@/utils/auth-feedback';
import { useLocalizedRouter } from '@/i18n/navigation';
import { getI18nServerSideProps } from '@/i18n/page-props';

export default function SocialAuthCallbackPage() {
  const router = useLocalizedRouter();
  const t = useTranslations('auth.login');
  const { showToast } = useToast();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (!router.isReady || hasHandledCallback.current) return;
    hasHandledCallback.current = true;

    const finalizeSocialLogin = async () => {
      const pending = consumePendingSocialAuth();
      const callback = parseSocialCallback();
      window.history.replaceState(null, document.title, window.location.pathname);

      const validation = validateSocialCallback(pending, callback);
      if (!validation.isValid || !pending || !callback.idToken) {
        console.error('[SocialCallback] invalid callback', {
          reason: validation.reason,
        });
        showToast(
          getAuthFeedback(
            t,
            resolveSocialLoginFailureFeedbackCode(validation.reason ?? callback.error)
          )
        );
        await router.replace({
          pathname: ROUTES.LOGIN,
          query: {
            callbackUrl: resolveSafeAuthRedirect(pending?.callbackUrl),
          },
        });
        return;
      }

      try {
        const response = await postSocialLogin({
          provider: pending.provider,
          idToken: callback.idToken,
          country: pending.country,
          marketing_consent: pending.marketingConsent,
        });

        if (!applyAuthSession(response)) {
          throw new Error('Missing auth session payload');
        }

        showToast(getAuthFeedback(t, 'social_login_success'));
        const redirectUrl =
          response.user.InterestSetting === false
            ? ROUTES.INTEREST
            : resolveSafeAuthRedirect(pending.callbackUrl);

        await router.replace(redirectUrl);
      } catch (error) {
        console.error('[SocialCallback] social login failed', error);
        showToast(getAuthFeedback(t, 'social_login_failed'));
        await router.replace({
          pathname: ROUTES.LOGIN,
          query: {
            callbackUrl: resolveSafeAuthRedirect(pending.callbackUrl),
          },
        });
      }
    };

    void finalizeSocialLogin();
  }, [router, router.isReady, showToast, t]);

  return (
    <div css={loadingWrapper}>
      <Loading fullHeight title={t('loggingIn')} />
    </div>
  );
}

const loadingWrapper = css`
  display: flex;
  min-height: 100vh;
`;

export const getServerSideProps = getI18nServerSideProps(['auth']);
