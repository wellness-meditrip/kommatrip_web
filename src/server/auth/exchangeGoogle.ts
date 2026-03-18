import axios from 'axios';
import type { PostUserAuthGoogleRequest, PostUserAuthGoogleResponse } from '@/models/auth';
import { postBackend, resolveBackendPayload } from '@/server/http/backend-client';

const GOOGLE_AUTH_PATH = 'user/non/auth/google';

export async function exchangeGoogle(
  params: PostUserAuthGoogleRequest
): Promise<PostUserAuthGoogleResponse> {
  try {
    const backendResponse = await postBackend<PostUserAuthGoogleResponse>(
      GOOGLE_AUTH_PATH,
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

    const result = resolveBackendPayload<PostUserAuthGoogleResponse>(backendResponse.data);
    if (!result?.user || !result?.tokens) {
      throw new Error('Invalid response from backend');
    }

    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[exchangeGoogle] backend error', {
        status: error.response?.status,
        data: error.response?.data,
        path: error.config?.url,
      });
    } else {
      console.error('[exchangeGoogle] unexpected error', error);
    }
    throw error;
  }
}
