import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { Location } from '@/icons';
import { convertGoogleDriveUrlToImageSrc } from '@/utils';
import Image from 'next/image';
import { useState } from 'react';
import { wrapper, profileWrapper, DetailsWrapper, address, tags } from './index.styles';

interface Props {
  companyImage: string;
  companyName: string;
  companyAddress: string;
  badges: string[];
}

// 업체 상세 정보 컴포넌트
export default function CompanyDetail({
  companyImage,
  companyName,
  companyAddress,
  badges,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const convertedUrl = convertGoogleDriveUrlToImageSrc(companyImage);

  const handleImageError = () => {
    console.log('Image load failed, falling back to default image');
    setImageError(true);
  };

  return (
    <div css={wrapper}>
      {convertedUrl && !imageError ? (
        <div css={profileWrapper}>
          <Image
            src={convertedUrl}
            alt="프로필 이미지"
            width={170}
            height={200}
            onError={handleImageError}
          />
        </div>
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
