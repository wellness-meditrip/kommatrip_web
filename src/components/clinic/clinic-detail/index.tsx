import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { Location } from '@/icons';
import { theme } from '@/styles';
import { convertGoogleDriveUrlToImageSrc } from '@/utils';
import { css } from '@emotion/react';
import Image from 'next/image';

interface Props {
  clinicImage: string;
  clinicName: string;
  clinicAddress: string;
  badges: string[];
}
// 병원 상세 정보 컴포넌트
export default function ClinicDetail({ clinicImage, clinicName, clinicAddress, badges }: Props) {
  const convertedUrl = convertGoogleDriveUrlToImageSrc(clinicImage);
  return (
    <div css={wrapper}>
      {!convertedUrl ? (
        <div css={profileWrapper}>
          <Image src="/default.png" alt="기본 이미지" width={170} height={200} />
        </div>
      ) : (
        <div css={profileWrapper}>
          <Image src={convertedUrl} alt="프로필 이미지" width={170} height={200} />
        </div>
      )}
      <div css={DetailsWrapper}>
        <Text typo="title_M" color="text_primary">
          {clinicName}
        </Text>
        <div css={address}>
          <Location width={16} height={16} />
          <Text typo="body_M" color="text_secondary">
            {clinicAddress}
          </Text>
        </div>
        <div css={tags}>
          {badges?.map((hashTag) => (
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

export const profileWrapper = css`
  width: 100%;
  height: 280px;
  display: flex;
  justify-content: center;
  align-items: center;

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
  padding: 16px 20px;
`;

export const address = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
