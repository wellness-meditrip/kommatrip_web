import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { Location } from '@/icons';
import { convertGoogleDriveUrlToImageSrc } from '@/utils';
import Image from 'next/image';
import { useState } from 'react';
import {
  wrapper,
  wrapperFixedHeight,
  DetailsWrapper,
  DetailsWrapperFixedHeight,
  address,
  tags,
  tagsFixedHeight,
  ratingBadge,
  star,
  ratingText,
} from './index.styles';

interface Props {
  clinicId: number;
  clinicImage: string;
  clinicName: string;
  clinicAddress: string;
  badges: string[];
  rating?: number;
  fixedHeight?: boolean;
  onClick: (clinicId: number) => void;
}

// 병원 카드 컴포넌트
export default function CompanyCard({
  clinicId,
  clinicImage,
  clinicName,
  clinicAddress,
  badges,
  rating,
  fixedHeight = false,
  onClick,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const convertedUrl = convertGoogleDriveUrlToImageSrc(clinicImage);

  const handleImageError = () => {
    console.log('Image load failed, falling back to default image for:', clinicName);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully for:', clinicName);
  };

  return (
    <div css={fixedHeight ? wrapperFixedHeight : wrapper} onClick={() => onClick(clinicId)}>
      <div css={profileWrapper}>
        {convertedUrl && !imageError ? (
          <Image
            src={convertedUrl}
            alt="프로필 이미지"
            width={170}
            height={200}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div css={profileWrapper}>
            <img
              src="/default.png"
              alt="기본 이미지"
              width={170}
              height={200}
              onError={() => console.log('Default image also failed to load for:', clinicName)}
              onLoad={() => console.log('Default image loaded successfully for:', clinicName)}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        )}
        {rating && (
          <div css={ratingBadge}>
            <span css={star}>⭐</span>
            <span css={ratingText}>{rating}</span>
          </div>
        )}
      </div>
      <div css={fixedHeight ? DetailsWrapperFixedHeight : DetailsWrapper}>
        <Text typo="title_M" color="text_primary">
          {clinicName}
        </Text>
        <div css={address}>
          <Location width={16} height={16} />
          <Text typo="body_M" color="text_primary">
            {clinicAddress}
          </Text>
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
