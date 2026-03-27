import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Text } from '@/components/text';
import {
  isOptimizableImage,
  normalizeSafeImageSrc,
  shouldBypassNextImageOptimization,
} from '@/utils/image';

interface HeroImageProps {
  src?: string | null;
  alt: string;
  fallbackText: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export function HeroImage({
  src,
  alt,
  fallbackText,
  sizes = '(max-width: 768px) 100vw, 420px',
  priority = true,
  quality = 80,
}: HeroImageProps) {
  const normalizedSrc = useMemo(() => normalizeSafeImageSrc(src), [src]);
  const [hasImageError, setHasImageError] = useState(() => !normalizedSrc);
  const [isImageReady, setIsImageReady] = useState(false);
  const handleImageError = () => {
    setHasImageError(true);
    setIsImageReady(false);
  };
  const handleImageLoad = () => {
    setIsImageReady(true);
  };

  useEffect(() => {
    setHasImageError(!normalizedSrc);
    setIsImageReady(false);
  }, [normalizedSrc]);

  const shouldUseNextImage = useMemo(() => isOptimizableImage(normalizedSrc), [normalizedSrc]);
  const shouldBypassOptimization = useMemo(
    () => shouldBypassNextImageOptimization(normalizedSrc),
    [normalizedSrc]
  );
  const isImageLoading = Boolean(normalizedSrc && !hasImageError && !isImageReady);

  return (
    <>
      {normalizedSrc &&
        !hasImageError &&
        (shouldUseNextImage ? (
          <Image
            src={normalizedSrc}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            priority={priority}
            unoptimized={shouldBypassOptimization}
            css={[mainImage, !isImageReady && hiddenImage]}
            onError={handleImageError}
            onLoadingComplete={handleImageLoad}
          />
        ) : (
          <img
            src={normalizedSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
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
      {!isImageLoading && (hasImageError || !normalizedSrc) && (
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
