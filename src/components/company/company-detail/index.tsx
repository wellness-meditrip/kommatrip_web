import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { Location, ChevronLeft, ChevronRight } from '@/icons';
import Image from 'next/image';
import { useState } from 'react';
import {
  wrapper,
  profileWrapper,
  DetailsWrapper,
  address,
  tags,
  carouselNavButton,
  carouselNavLeft,
  carouselNavRight,
  carouselDots,
  carouselDot,
  carouselDotActive,
} from './index.styles';

interface Props {
  companyImage: string;
  companyName: string;
  companyAddress: string;
  badges: string[];
  images?: string[]; // 이미지 캐러셀용 배열 추가
}

// 업체 상세 정보 컴포넌트
export default function CompanyDetail({
  companyImage,
  companyName,
  companyAddress,
  badges,
  images = [],
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 이미지 배열이 있으면 사용, 없으면 기본 이미지 사용
  const imageList = images.length > 0 ? images : [companyImage];
  const currentImageUrl = imageList[currentImageIndex];

  const handleImageError = () => {
    console.log('Image load failed, falling back to default image');
    setImageError(true);
  };

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
    <div css={wrapper}>
      {imageList.length > 1 ? (
        <div css={profileWrapper}>
          {currentImageUrl && !imageError ? (
            <Image
              src={currentImageUrl}
              alt="프로필 이미지"
              width={170}
              height={200}
              onError={handleImageError}
            />
          ) : (
            <img src="/default.png" alt="기본 이미지" width={170} height={200} />
          )}

          {/* 캐러셀 네비게이션 버튼 */}
          <button
            css={[carouselNavButton, carouselNavLeft]}
            onClick={handlePrevImage}
            aria-label="이전 이미지"
          >
            <ChevronLeft width={24} height={24} />
          </button>
          <button
            css={[carouselNavButton, carouselNavRight]}
            onClick={handleNextImage}
            aria-label="다음 이미지"
          >
            <ChevronLeft width={24} height={24} style={{ transform: 'rotate(180deg)' }} />
          </button>

          {/* 캐러셀 도트 인디케이터 */}
          <div css={carouselDots}>
            {imageList.map((_, index) => (
              <button
                key={index}
                css={index === currentImageIndex ? carouselDotActive : carouselDot}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDotClick(index);
                }}
                aria-label={`이미지 ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div css={profileWrapper}>
          {currentImageUrl && !imageError ? (
            <Image
              src={currentImageUrl}
              alt="프로필 이미지"
              width={170}
              height={200}
              onError={handleImageError}
            />
          ) : (
            <img src="/default.png" alt="기본 이미지" width={170} height={200} />
          )}
        </div>
      )}
      <div css={DetailsWrapper}>
        <Text typo="title_M" color="text_primary">
          {companyName}
        </Text>
        <div css={address}>
          <Location width={16} height={16} />
          <Text typo="body_M" color="text_secondary">
            {companyAddress}
          </Text>
        </div>
        <div css={tags}>
          {badges?.map((hashTag) => (
            <Tag key={hashTag} service="meditrip" variant="line">
              {hashTag}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
