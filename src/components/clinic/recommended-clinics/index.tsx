import React from 'react';
import { Text } from '@/components/text';
import { css } from '@emotion/react';
import ClinicCard from '@/components/clinic/clinic-card';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants/commons/routes';

interface RecommendedClinicsProps {
  clinics: Array<{
    hospital_id: number;
    hospital_name: string;
    address: string;
    rating: number;
    image_url: string;
    departments: string[];
  }>;
}

export function RecommendedClinics({ clinics }: RecommendedClinicsProps) {
  const router = useRouter();

  return (
    <div css={container}>
      <Text typo="title_M" color="text_primary" css={title}>
        이런 한의원은 어떠세요?
      </Text>
      <div css={grid}>
        {clinics.map((clinic) => (
          <ClinicCard
            key={clinic.hospital_id}
            clinicId={clinic.hospital_id}
            badges={clinic.departments}
            onClick={(clinicId: number) => {
              router.push(ROUTES.CLINICS_DETAIL(clinicId));
            }}
            clinicImage={clinic.image_url}
            clinicName={clinic.hospital_name}
            clinicAddress={clinic.address}
            rating={clinic.rating}
            fixedHeight={true}
          />
        ))}
      </div>
    </div>
  );
}

const container = css`
  width: 100%;
`;

const title = css`
  margin: 24px 0 !important;
  padding: 0 20px;
  text-align: center;
`;

const grid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 20px;
  margin: 24px 0;
`;
