import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { ChevronLeft, Copy } from '@/icons';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks';
import {
  wrapper,
  profileWrapper,
  DetailsWrapper,
  address,
  addressText,
  copyButton,
  tags,
  carouselNavButton,
  carouselNavLeft,
  carouselNavRight,
  carouselDots,
  carouselDot,
  carouselDotActive,
  imageLoadingOverlay,
  imageLoadingSpinner,
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
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { showToast } = useToast();

  // 이미지 배열이 있으면 사용, 없으면 기본 이미지 사용
  const imageList = images.length > 0 ? images : [companyImage];
  const currentImageUrl = imageList[currentImageIndex];

  const handleImageError = () => {
    console.log('Image load failed, falling back to default image');
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleDotClick = (index: number) => {
    setIsImageLoading(true);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  const handleCopyAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const value = companyAddress?.trim();
    if (!value) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value);
      showToast({ title: 'Address copied', icon: 'check' });
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast({ title: 'Address copied', icon: 'check' });
  };

  return (
    <div css={wrapper}>
      {imageList.length > 1 ? (
        <div css={profileWrapper}>
          {currentImageUrl && !imageError ? (
            <Image
              src={currentImageUrl}
              alt="프로필 이미지"
              fill
              sizes="100vw"
              quality={90}
              onError={handleImageError}
              onLoadingComplete={() => setIsImageLoading(false)}
            />
          ) : (
            <img src="/default.png" alt="기본 이미지" onLoad={() => setIsImageLoading(false)} />
          )}
          {isImageLoading && (
            <div css={imageLoadingOverlay}>
              <div css={imageLoadingSpinner} aria-hidden="true" />
            </div>
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
              fill
              sizes="100vw"
              quality={90}
              onError={handleImageError}
              onLoadingComplete={() => setIsImageLoading(false)}
            />
          ) : (
            <img src="/default.png" alt="기본 이미지" onLoad={() => setIsImageLoading(false)} />
          )}
          {isImageLoading && (
            <div css={imageLoadingOverlay}>
              <div css={imageLoadingSpinner} aria-hidden="true" />
            </div>
          )}
        </div>
      )}
      <div css={DetailsWrapper}>
        <Text typo="title_M" color="text_primary">
          {companyName}
        </Text>
        <div css={address}>
          <Text typo="body_M" color="text_secondary" css={addressText}>
            {companyAddress}
          </Text>
          <button type="button" css={copyButton} onClick={handleCopyAddress} aria-label="주소 복사">
            <Copy width={14} height={14} />
          </button>
        </div>
        <div css={tags}>
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
