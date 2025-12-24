import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { Location, ChevronLeftWhite } from '@/icons';
import Image from 'next/image';
import { useState } from 'react';
import {
  wrapper,
  wrapperFixedHeight,
  profileWrapper,
  DetailsWrapper,
  DetailsWrapperFixedHeight,
  tags,
  tagsFixedHeight,
  ratingBadge,
  titleRow,
  exclusiveBadge,
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
  images?: string[]; // 여러 이미지 배열 추가
  isExclusive?: boolean;
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
  images = [],
  isExclusive = false,
  onClick,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 이미지 배열이 있으면 사용, 없으면 기본 이미지 사용
  const imageList = images.length > 0 ? images : [companyImage];
  const currentImageUrl = imageList[currentImageIndex];

  const handleImageError = () => {
    console.log('Image load failed, falling back to default image for:', companyName);
    setImageError(true);
  };

  // const handleImageLoad = () => {
  //   console.log('Image loaded successfully for:', companyName);
  // };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div css={fixedHeight ? wrapperFixedHeight : wrapper} onClick={() => onClick(companyId)}>
      <div css={profileWrapper}>
        {imageList.length > 1 ? (
          <div css={imageCarousel}>
            <div css={carouselContainer}>
              {currentImageUrl && !imageError ? (
                <Image
                  src={currentImageUrl}
                  alt="프로필 이미지"
                  width={170}
                  height={200}
                  onError={handleImageError}
                  // onLoad={handleImageLoad}
                  css={carouselImage}
                />
              ) : (
                <img
                  src="/default.png"
                  alt="기본 이미지"
                  width={170}
                  height={200}
                  css={carouselImage}
                />
              )}
              <button
                css={[carouselNavButton, carouselNavLeft]}
                onClick={handlePrevImage}
                aria-label="이전 이미지"
              >
                <ChevronLeftWhite width={32} height={34} />
              </button>
              <button
                css={[carouselNavButton, carouselNavRight]}
                onClick={handleNextImage}
                aria-label="다음 이미지"
              >
                <ChevronLeftWhite width={32} height={34} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
            <div css={carouselDots}>
              {imageList.map((_, index) => (
                <button
                  key={index}
                  css={index === currentImageIndex ? carouselDotActive : carouselDot}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDotClick(index);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {currentImageUrl && !imageError ? (
              <Image
                src={currentImageUrl}
                alt="프로필 이미지"
                width={170}
                height={200}
                onError={handleImageError}
              />
            ) : (
              <div css={profileWrapper}>
                <img
                  src="/default.png"
                  alt="기본 이미지"
                  width={170}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
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
      <div css={fixedHeight ? DetailsWrapperFixedHeight : DetailsWrapper}>
        <div css={titleRow}>
          <Text typo="title_M" color="text_primary">
            {companyName}
          </Text>
          {isExclusive && <span css={exclusiveBadge}>Exclusive</span>}
        </div>

        <div css={fixedHeight ? tagsFixedHeight : tags}>
          {badges?.slice(0, fixedHeight ? 2 : badges.length).map((hashTag) => (
            <Tag key={hashTag} service="meditrip" variant="line">
              #{hashTag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
