type AuthLoginMessageKey =
  | 'loginSuccessful'
  | 'loginFailed'
  | 'failedToGetToken'
  | 'prepareLoginFailed'
  | 'socialLoginSuccess'
  | 'socialLoginFailed'
  | 'socialLoginCancelled'
  | 'socialLoginExpired'
  | 'socialLoginPrepareFailed';

export type AuthFeedbackCode =
  | 'login_success'
  | 'login_failed'
  | 'token_missing'
  | 'prepare_login_failed'
  | 'social_login_success'
  | 'social_login_failed'
  | 'social_login_cancelled'
  | 'social_login_expired'
  | 'social_login_prepare_failed';

type Translate = (key: AuthLoginMessageKey) => string;

const AUTH_FEEDBACK_MESSAGE_KEYS: Record<AuthFeedbackCode, AuthLoginMessageKey> = {
  login_success: 'loginSuccessful',
  login_failed: 'loginFailed',
  token_missing: 'failedToGetToken',
  prepare_login_failed: 'prepareLoginFailed',
  social_login_success: 'socialLoginSuccess',
  social_login_failed: 'socialLoginFailed',
  social_login_cancelled: 'socialLoginCancelled',
  social_login_expired: 'socialLoginExpired',
  social_login_prepare_failed: 'socialLoginPrepareFailed',
};

const AUTH_FEEDBACK_ICONS: Record<AuthFeedbackCode, 'check' | 'exclaim'> = {
  login_success: 'check',
  login_failed: 'exclaim',
  token_missing: 'exclaim',
  prepare_login_failed: 'exclaim',
  social_login_success: 'check',
  social_login_failed: 'exclaim',
  social_login_cancelled: 'exclaim',
  social_login_expired: 'exclaim',
  social_login_prepare_failed: 'exclaim',
};

export const getAuthFeedback = (t: Translate, code: AuthFeedbackCode) => ({
  title: t(AUTH_FEEDBACK_MESSAGE_KEYS[code]),
  icon: AUTH_FEEDBACK_ICONS[code],
});

export const resolveLoginErrorFeedbackCode = (error: string): AuthFeedbackCode => {
  switch (error) {
    case 'social_login_cancelled':
      return 'social_login_cancelled';
    case 'social_login_expired':
      return 'social_login_expired';
    case 'social_login_failed':
      return 'social_login_failed';
    default:
      return 'login_failed';
  }
};

export const resolveSocialLoginFailureFeedbackCode = (reason?: string | null): AuthFeedbackCode => {
  switch (reason) {
    case 'access_denied':
      return 'social_login_cancelled';
    case 'missing_pending_auth':
    case 'missing_callback_params':
    case 'invalid_state':
    case 'invalid_nonce':
      return 'social_login_expired';
    default:
      return 'social_login_failed';
  }
};
