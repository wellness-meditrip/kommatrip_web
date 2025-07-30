import { Dim } from '@/components/dim';
import { Tag } from '@/components/tag';
import { Text } from '@/components/text';
import { DefaultImage } from '@/icons';
import { theme } from '@/styles';
import { css } from '@emotion/react';

interface Props {
  clinicId: number;
  clinicImage: string;
  clinicName: string;
  clinicAddress: string;
  badges: string[];
  onClick: (clinicId: number) => void;
}
// 병원 카드 컴포넌트
export default function ClinicCard({
  clinicId,
  clinicImage,
  clinicName,
  clinicAddress,
  badges,
  onClick,
}: Props) {
  return (
    <div css={wrapper} onClick={() => onClick(clinicId)}>
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
          <Text typo="body_M" color="text_primary">
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
  height: 200px;
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
  padding: 16px;
`;

export const tags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
