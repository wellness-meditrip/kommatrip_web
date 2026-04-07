import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { Location, ChevronLeftWhite } from '@/icons';
import NextImage from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeSafeImageSrc, shouldBypassNextImageOptimization } from '@/utils/image';
import { useTranslations } from 'next-intl';
import {
  wrapper,
  wrapperFixedHeight,
  profileWrapper,
  profileWrapperFixedHeight,
  DetailsWrapper,
  DetailsWrapperFixedHeight,
  tags,
  tagsFixedHeight,
  ratingBadge,
  titleRow,
  titleText,
  exclusiveBadge,
  wrapperCompact,
  profileWrapperCompact,
  DetailsWrapperCompact,
  DetailsWrapperFixedHeightCompact,
  imageCarousel,
  carouselContainer,
  carouselImage,
  carouselDots,
  carouselDot,
  carouselDotActive,
  carouselNavButton,
  carouselNavLeft,
  carouselNavRight,
} from './index.styles';

interface Props {
  companyId: number;
  companyImage: string;
  companyName: string;
  companyAddress: string;
  badges: string[];
  fixedHeight?: boolean;
  size?: 'default' | 'compact';
  images?: string[]; // 여러 이미지 배열 추가
  isExclusive?: boolean;
  carouselDotsMode?: 'static' | 'hidden';
  onClick: (clinicId: number) => void;
}

// 병원 카드 컴포넌트
export function CompanyCard({
  companyId,
  companyImage,
  companyName,
  companyAddress,
  badges,
  fixedHeight = false,
  size = 'default',
  images = [],
  isExclusive = false,
  carouselDotsMode = 'static',
  onClick,
}: Props) {
  const t = useTranslations('common');
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ignoreClickRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  // 이미지 배열이 있으면 사용, 없으면 기본 이미지 사용
  const imageList = useMemo(() => {
    const normalizedImages = [...images, companyImage]
      .map((imageUrl) => normalizeSafeImageSrc(imageUrl))
      .filter(Boolean);

    const dedupedImages = Array.from(new Set(normalizedImages));
    return dedupedImages.length > 0 ? dedupedImages : ['/default.png'];
  }, [images, companyImage]);
  const currentImageUrl = imageList[currentImageIndex];
  const shouldBypassOptimization = shouldBypassNextImageOptimization(currentImageUrl);

  const handleImageError = () => {
    console.log('Image load failed, falling back to default image for:', companyName);
    setImageError(true);
  };

  // const handleImageLoad = () => {
  //   console.log('Image loaded successfully for:', companyName);
  // };

  useEffect(() => {
    setImageError(false);
  }, [currentImageIndex]);

  useEffect(() => {
    if (currentImageIndex < imageList.length) return;
    setCurrentImageIndex(0);
  }, [currentImageIndex, imageList.length]);

  const goPrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const goNextImage = () => {
    setCurrentImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goPrevImage();
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    goNextImage();
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (imageList.length < 2) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = event.touches[0]?.clientX ?? touchStartX.current;
    touchDeltaX.current = currentX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const deltaX = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(deltaX) < 30) return;
    ignoreClickRef.current = true;
    if (deltaX > 0) {
      goPrevImage();
    } else {
      goNextImage();
    }
    window.setTimeout(() => {
      ignoreClickRef.current = false;
    }, 50);
  };

  return (
    <div
      css={[fixedHeight ? wrapperFixedHeight : wrapper, size === 'compact' && wrapperCompact]}
      onClick={() => {
        if (ignoreClickRef.current) return;
        onClick(companyId);
      }}
    >
      <div
        css={[
          fixedHeight ? profileWrapperFixedHeight : profileWrapper,
          size === 'compact' && profileWrapperCompact,
        ]}
      >
        {imageList.length > 1 ? (
          <div
            css={imageCarousel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div css={carouselContainer}>
              {currentImageUrl && !imageError ? (
                <NextImage
                  src={currentImageUrl}
                  alt={t('company.imageAlt', { name: companyName })}
                  fill
                  sizes="(min-width: 1024px) 353px, (min-width: 768px) 50vw, 100vw"
                  quality={80}
                  onError={handleImageError}
                  unoptimized={shouldBypassOptimization}
                  // onLoad={handleImageLoad}
                  css={carouselImage}
                />
              ) : (
                <img src="/default.png" alt={t('company.fallbackImageAlt')} css={carouselImage} />
              )}
              <button
                type="button"
                css={[carouselNavButton, carouselNavLeft]}
                onClick={handlePrevImage}
                aria-label={t('button.previous')}
              >
                <ChevronLeftWhite width={32} height={34} />
              </button>
              <button
                type="button"
                css={[carouselNavButton, carouselNavRight]}
                onClick={handleNextImage}
                aria-label={t('button.next')}
              >
                <ChevronLeftWhite width={32} height={34} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
            {carouselDotsMode === 'static' && (
              <div css={carouselDots} aria-hidden="true">
                {imageList.map((_, index) => (
                  <span
                    key={index}
                    css={index === currentImageIndex ? carouselDotActive : carouselDot}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {currentImageUrl && !imageError ? (
              <NextImage
                src={currentImageUrl}
                alt={t('company.imageAlt', { name: companyName })}
                fill
                sizes="(min-width: 1024px) 353px, (min-width: 768px) 50vw, 100vw"
                quality={80}
                onError={handleImageError}
                unoptimized={shouldBypassOptimization}
                css={carouselImage}
              />
            ) : (
              <img src="/default.png" alt={t('company.fallbackImageAlt')} css={carouselImage} />
            )}
          </>
        )}
        {companyAddress && (
          <div css={ratingBadge}>
            <Location width={16} height={16} />
            <Text typo="body_M" color="text_primary">
              {companyAddress}
            </Text>
          </div>
        )}
      </div>
      <div
        css={[
          fixedHeight ? DetailsWrapperFixedHeight : DetailsWrapper,
          size === 'compact' && DetailsWrapperCompact,
          size === 'compact' && fixedHeight && DetailsWrapperFixedHeightCompact,
        ]}
      >
        <div css={titleRow}>
          <Text typo="title_M" color="text_primary" css={titleText}>
            {companyName}
          </Text>
          {isExclusive && <span css={exclusiveBadge}>{t('company.exclusive')}</span>}
        </div>

        <div css={fixedHeight ? tagsFixedHeight : tags}>
          {badges?.map((hashTag) => (
            <Tag key={hashTag} service="kommatrip" variant="line">
              {hashTag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
