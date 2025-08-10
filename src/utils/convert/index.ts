import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';

interface ClinicReviewKeywordRequest {
  category: string;
  keyword_code: string;
  keyword_name: string;
  is_positive: boolean;
}
// convertGoogleDriveUrl
export function convertGoogleDriveUrlToImageSrc(sharedUrl: string): string | null {
  const match = sharedUrl.match(/\/file\/d\/([^/]+)\//);
  if (!match) return null;

  const fileId = match[1];
  
  // 방법 1: 기존 방식
  // return `https://drive.google.com/uc?export=view&id=${fileId}`;
  
  // 방법 2: 새로운 방식 (더 안정적)
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  
  // 방법 3: 직접 다운로드 링크 (백업)
  // return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// convertKeywordNamesToRequestPayload
export const convertKeywordNamesToRequestPayload = (
  selectedKeywordNames: string[]
): ClinicReviewKeywordRequest[] => {
  return selectedKeywordNames
    .map((name) => CLINIC_REVIEW_KEYWORDS.find((k) => k.keyword_name === name))
    .filter((k): k is ClinicReviewKeywordRequest => !!k);
};

// convertBlobToBase64
export const convertBlobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string); // base64 문자열
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
  });
};
