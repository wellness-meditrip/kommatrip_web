import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';

interface ClinicReviewKeywordRequest {
  category: string;
  keyword_code: string;
  keyword_name: string;
  is_positive: boolean;
}
export function convertGoogleDriveUrlToImageSrc(sharedUrl: string): string | null {
  const match = sharedUrl.match(/\/file\/d\/([^/]+)\//);
  if (!match) return null;

  const fileId = match[1];

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

export const convertKeywordNamesToRequestPayload = (
  selectedKeywordNames: string[]
): ClinicReviewKeywordRequest[] => {
  return selectedKeywordNames
    .map((name) => CLINIC_REVIEW_KEYWORDS.find((k) => k.keyword_name === name))
    .filter((k): k is ClinicReviewKeywordRequest => !!k);
};

export const convertBlobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
  });
};
