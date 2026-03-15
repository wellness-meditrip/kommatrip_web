import axios from 'axios';
import type { PostUserAuthAppleRequest, PostUserAuthAppleResponse } from '@/models/auth';
import { postBackend, resolveBackendPayload } from '@/server/http/backend-client';

const APPLE_AUTH_PATH = 'user/non/auth/apple';

export async function exchangeApple(
  params: PostUserAuthAppleRequest
): Promise<PostUserAuthAppleResponse> {
  try {
    const backendResponse = await postBackend<PostUserAuthAppleResponse>(
      APPLE_AUTH_PATH,
      {
        idToken: params.idToken,
        country: params.country,
        marketing_consent: params.marketing_consent,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const result = resolveBackendPayload<PostUserAuthAppleResponse>(backendResponse.data);
    if (!result?.user || !result?.tokens) {
      throw new Error('Invalid response from backend');
    }

    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[exchangeApple] backend error', {
        status: error.response?.status,
        data: error.response?.data,
        path: error.config?.url,
      });
    } else {
      console.error('[exchangeApple] unexpected error', error);
    }
    throw error;
  }
}
