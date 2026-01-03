import type { PostUserAuthAppleRequest, PostUserAuthAppleResponse } from '@/models/auth';
import { postUserAuthApple } from '@/apis';

export async function exchangeApple(
  params: PostUserAuthAppleRequest
): Promise<PostUserAuthAppleResponse> {
  console.info('[exchangeApple] request', {
    country: params.country,
    marketing_consent: params.marketing_consent,
    idTokenLen: params.idToken?.length ?? 0,
  });

  try {
    const result = await postUserAuthApple({
      idToken: params.idToken,
      country: params.country,
      marketing_consent: params.marketing_consent,
    });

    if (!result.user || !result.tokens) {
      console.error('[exchangeApple] invalid schema', result);
      throw new Error('Invalid response from backend');
    }

    console.info('[exchangeApple] success', {
      userId: result.user.id,
      loginMethod: result.user.login_method,
    });

    return result;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: unknown;
        headers?: unknown;
      };
      message?: string;
    };
    if (axiosError?.response) {
      console.error('[exchangeApple] error response', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data,
        headers: axiosError.response.headers,
      });
    } else if (axiosError?.message) {
      console.error('[exchangeApple] error message', axiosError.message);
    }
    console.error('[exchangeApple] full error', axiosError);
    throw axiosError;
  }
}
