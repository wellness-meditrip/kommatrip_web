import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Text } from '@/components/text';

interface HeroImageProps {
  src?: string | null;
  alt: string;
  fallbackText: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

const OPTIMIZABLE_IMAGE_HOSTNAMES = [
  'drive.google.com',
  'meditrip.s3.ap-northeast-2.amazonaws.com',
  'meditripstorage.blob.core.windows.net',
] as const;

const normalizeSafeSrc = (rawSrc?: string | null): string => {
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

const isOptimizableImage = (url: string) => {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') return false;
    return OPTIMIZABLE_IMAGE_HOSTNAMES.includes(
      parsedUrl.hostname as (typeof OPTIMIZABLE_IMAGE_HOSTNAMES)[number]
    );
  } catch {
    return false;
  }
};

export function HeroImage({
  src,
  alt,
  fallbackText,
  sizes = '(max-width: 768px) 100vw, 420px',
  priority = true,
  quality = 80,
}: HeroImageProps) {
  const [imageSrc, setImageSrc] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  const handleImageError = () => {
    setImageSrc('');
    setIsImageLoading(false);
    setIsImageReady(false);
  };
  const handleImageLoad = () => {
    setIsImageLoading(false);
    setIsImageReady(true);
  };

  useEffect(() => {
    const nextSrc = normalizeSafeSrc(src);
    setImageSrc(nextSrc);
    setIsImageLoading(Boolean(nextSrc));
    setIsImageReady(false);
  }, [src]);

  const shouldUseNextImage = useMemo(() => isOptimizableImage(imageSrc), [imageSrc]);
  return (
    <>
      {imageSrc &&
        (shouldUseNextImage ? (
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            priority={priority}
            css={[mainImage, !isImageReady && hiddenImage]}
            onError={handleImageError}
            onLoadingComplete={handleImageLoad}
          />
        ) : (
          <img
            src={imageSrc}
            alt={alt}
            css={[mainImage, !isImageReady && hiddenImage]}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ))}
      {isImageLoading && (
        <div css={imageLoadingOverlay}>
          <div css={imageLoadingSpinner} aria-hidden="true" />
        </div>
      )}
      {!isImageLoading && !imageSrc && (
        <div css={imageFallback}>
          <Text typo="body_M" color="text_tertiary">
            {fallbackText}
          </Text>
        </div>
      )}
    </>
  );
}

const mainImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  transition: opacity 0.2s ease;
`;

const hiddenImage = css`
  opacity: 0;
`;

const imageLoadingOverlay = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 3;
  inset: 0;
  background: linear-gradient(180deg, rgb(255 255 255 / 65%), rgb(255 255 255 / 35%));
  backdrop-filter: blur(4px);
`;

const imageLoadingSpinner = css`
  width: 28px;
  height: 28px;
  border: 2px solid ${theme.colors.gray200};
  border-top-color: ${theme.colors.primary50};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const imageFallback = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px;
`;
