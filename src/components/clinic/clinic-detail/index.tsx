import { Dim } from '@/components/dim';
import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { DefaultImage, Location } from '@/icons';
import { theme } from '@/styles';
import { css } from '@emotion/react';

interface Props {
  clinicImage: string;
  clinicName: string;
  clinicAddress: string;
  badges: string[];
}
// 병원 상세 정보 컴포넌트
export default function ClinicDetail({ clinicImage, clinicName, clinicAddress, badges }: Props) {
  return (
    <div css={wrapper}>
      {!clinicImage ? (
        <div css={profileWrapper}>
          <DefaultImage />
        </div>
      ) : (
        // <Image src={clinicImage} alt="프로필 이미지" width={170} height={200} />
        <Dim />
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
          <Text typo="body_M" color="text_secondary">
            |
          </Text>
          <div>별점</div>
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
