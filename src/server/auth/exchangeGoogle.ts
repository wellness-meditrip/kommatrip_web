// import axios from 'axios';
// import type { PostUserAuthGoogleRequest, PostUserAuthGoogleResponse } from '@/models/auth';

// /**
//  * Google OAuth idToken을 백엔드로 교환하여 서비스 토큰/유저 정보를 받아옵니다.
//  * 서버 사이드에서만 호출되므로 환경변수로 직접 API URL을 사용합니다.
//  */
// export async function exchangeGoogle(
//   params: PostUserAuthGoogleRequest
// ): Promise<PostUserAuthGoogleResponse> {
//   const apiUrl = process.env.BACKEND_BASE_URL;
//   if (!apiUrl) {
//     throw new Error('BACKEND_BASE_URL is not set');
//   }

//   try {
//     const response = await axios.post<{ response?: PostUserAuthGoogleResponse }>(
//       `${apiUrl}/api/users/auth/google`,
//       {
//         idToken: params.idToken,
//         country: params.country,
//         marketing_consent: params.marketing_consent,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         timeout: 10000,
//       }
//     );

//     if (!response.data.response?.user || !response.data.response?.tokens) {
//       throw new Error('Invalid response from backend');
//     }

//     return response.data.response as PostUserAuthGoogleResponse;
//   } catch (error) {
//     // if (axios.isAxiosError(error)) {
//     //   const errorData = error.response?.data;
//     //   const message =
//     //     errorData?.error?.message || errorData?.message || error.message || 'Google 인증 실패';
//     //   throw new Error(message);
//     // }
//     // throw error;
//     if (axios.isAxiosError(error)) {
//       console.error('[exchangeGoogle]', {
//         url: `${apiUrl}/api/users/auth/google`,
//         status: error.response?.status,
//         data: error.response?.data,
//       });
//     }
//     throw error;
//   }
// }
import type { PostUserAuthGoogleRequest, PostUserAuthGoogleResponse } from '@/models/auth';
import { postUserAuthGoogle } from '@/apis';

export async function exchangeGoogle(
  params: PostUserAuthGoogleRequest
): Promise<PostUserAuthGoogleResponse> {
  // ✅ [LOG ADDED] 요청 메타 로그 (민감 정보 최소화)
  console.info('[exchangeGoogle] request', {
    country: params.country,
    marketing_consent: params.marketing_consent,
    idTokenLen: params.idToken?.length ?? 0,
  });

  try {
    // ✅ [MODIFIED] guestApi 기반 API 호출
    const result = await postUserAuthGoogle({
      idToken: params.idToken,
      country: params.country,
      marketing_consent: params.marketing_consent,
    });

    // ✅ [MODIFIED] 실제 백엔드 응답 구조 기준 검증
    if (!result.user || !result.tokens) {
      console.error('[exchangeGoogle] invalid schema', result);
      throw new Error('Invalid response from backend');
    }

    console.info('[exchangeGoogle] success', {
      userId: result.user.id,
      loginMethod: result.user.login_method,
    });

    return result; // ✅ [MODIFIED]
  } catch (error) {
    // ✅ [MODIFIED] 모든 에러를 상위로 전달 (NextAuth가 처리)
    console.error('[exchangeGoogle] error', error);
    throw error;
  }
}
