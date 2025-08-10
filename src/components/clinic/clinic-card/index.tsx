import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { DefaultImage, Location } from '@/icons';
import { theme } from '@/styles';
import { convertGoogleDriveUrlToImageSrc } from '@/utils';
import { css } from '@emotion/react';
import Image from 'next/image';

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
export default function ClinicCard({
  clinicId,
  clinicImage,
  clinicName,
  clinicAddress,
  badges,
  rating,
  fixedHeight = false,
  onClick,
}: Props) {
  const convertedUrl = convertGoogleDriveUrlToImageSrc(clinicImage);

  return (
    <div css={fixedHeight ? wrapperFixedHeight : wrapper} onClick={() => onClick(clinicId)}>
      {!convertedUrl ? (
        <div css={profileWrapper}>
          <DefaultImage />
          {rating && (
            <div css={ratingBadge}>
              <span css={star}>⭐</span>
              <span css={ratingText}>{rating}</span>
            </div>
          )}
        </div>
      ) : (
        <div css={profileWrapper}>
          <Image src={convertedUrl} alt="프로필 이미지" width={170} height={200} />
          {rating && (
            <div css={ratingBadge}>
              <span css={star}>⭐</span>
              <span css={ratingText}>{rating}</span>
            </div>
          )}
        </div>
      )}
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
export const wrapper = css`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.white};
  border-radius: 12px;
  width: 100%;
  height: fit-content;
  cursor: pointer;
`;

export const wrapperFixedHeight = css`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.white};
  border-radius: 12px;
  width: 100%;
  height: 320px;
  cursor: pointer;
`;

export const profileWrapper = css`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;

  svg,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const profileImage = css`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const DetailsWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

export const DetailsWrapperFixedHeight = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  height: 120px;
  overflow: hidden;
`;

export const address = css`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    flex-shrink: 0;
  }
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const tagsFixedHeight = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
`;

export const ratingBadge = css`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
`;

export const star = css`
  font-size: 12px;
`;

export const ratingText = css`
  font-size: 12px;
  font-weight: bold;
`;
