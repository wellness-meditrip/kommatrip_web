export interface ImageMetadata {
  image_data: string; // Base64 인코딩된 이미지 데이터
  image_type: string; // 이미지 타입 (jpg, png, webp)
  original_filename: string; // 원본 파일명
  file_size: number; // 파일 크기 (bytes)
  width: number; // 이미지 너비
  height: number; // 이미지 높이
  image_order: number; // 이미지 순서
  alt_text?: string; // 이미지 설명
}

export const OPTIMIZABLE_IMAGE_HOSTNAMES = [
  'drive.google.com',
  'meditrip.s3.ap-northeast-2.amazonaws.com',
  'meditripstorage.blob.core.windows.net',
] as const;

export const normalizeSafeImageSrc = (rawSrc?: string | null): string => {
  const value = rawSrc?.trim() ?? '';
  if (!value) return '';
  if (value.startsWith('/')) return value;

  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
      return value;
    }

    return '';
  } catch {
    return '';
  }
};

export const isOptimizableImage = (rawSrc?: string | null): boolean => {
  const src = normalizeSafeImageSrc(rawSrc);
  if (!src) return false;
  if (src.startsWith('/')) return true;

  try {
    const parsedUrl = new URL(src);
    if (parsedUrl.protocol !== 'https:') return false;

    return OPTIMIZABLE_IMAGE_HOSTNAMES.includes(
      parsedUrl.hostname as (typeof OPTIMIZABLE_IMAGE_HOSTNAMES)[number]
    );
  } catch {
    return false;
  }
};

export const shouldBypassNextImageOptimization = (rawSrc?: string | null): boolean => {
  const src = normalizeSafeImageSrc(rawSrc);
  if (!src || src.startsWith('/')) return false;

  try {
    const parsedUrl = new URL(src);
    return (
      parsedUrl.hostname === 'meditripstorage.blob.core.windows.net' &&
      parsedUrl.searchParams.has('sig')
    );
  } catch {
    return false;
  }
};

/**
 * File 객체에서 이미지 메타데이터를 추출하는 함수
 */
export const extractImageMetadata = async (
  file: File,
  imageOrder: number,
  altText?: string
): Promise<ImageMetadata> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onloadend = () => {
      const dataURL = reader.result as string;
      // data:image/png;base64, 프리픽스 제거하여 순수 base64 데이터만 추출
      const base64Data = dataURL.split(',')[1];

      img.onload = () => {
        const imageType = file.type.split('/')[1] || 'jpeg';

        resolve({
          image_data: base64Data,
          image_type: imageType,
          original_filename: file.name,
          file_size: file.size,
          width: img.width,
          height: img.height,
          image_order: imageOrder,
          alt_text: altText || `${file.name} 이미지`,
        });
      };

      img.onerror = () => {
        reject(new Error('이미지 로드에 실패했습니다.'));
      };

      img.src = dataURL;
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * 여러 이미지 파일에서 메타데이터를 추출하는 함수
 */
export const extractMultipleImageMetadata = async (
  files: File[],
  startOrder: number = 1
): Promise<ImageMetadata[]> => {
  const promises = files.map((file, index) => extractImageMetadata(file, startOrder + index));

  return Promise.all(promises);
};
